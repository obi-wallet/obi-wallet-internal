import { Asset, AssetRegistry } from "@obi-wallet/sdk-asset-registry";
import { Caip19AssetId } from "@obi-wallet/sdk-caip";
import { Effect, pipe, Stream, SubscriptionRef } from "effect";

import { simulate } from "../../fast-travel-worker";

export interface TunnelServiceStateCommon {
  from: {
    asset: Caip19AssetId | null;
    prettyAmount: string;
  };
}

export interface TunnelServiceStateIdle extends TunnelServiceStateCommon {
  status: "idle";
}

export interface TunnelServiceStateSimulating extends TunnelServiceStateCommon {
  status: "simulating";
  from: {
    asset: Caip19AssetId;
    prettyAmount: string;
  };
  to: {
    asset: Caip19AssetId;
  };
}

export interface TunnelServiceStateDone extends TunnelServiceStateCommon {
  status: "done";
  from: {
    asset: Caip19AssetId;
    rawAmount: string;
    prettyAmount: string;
  };
  to: {
    asset: Caip19AssetId;
    rawAmount: string;
    prettyAmount: string;
  };
}

export interface TunnelServiceStateError extends TunnelServiceStateCommon {
  status: "error";
  error: string;
}

export type TunnelServiceState =
  | TunnelServiceStateIdle
  | TunnelServiceStateSimulating
  | TunnelServiceStateDone
  | TunnelServiceStateError;

export class TunnelService {
  protected assetRef: SubscriptionRef.SubscriptionRef<Caip19AssetId | null>;
  protected amountRef: SubscriptionRef.SubscriptionRef<string>;

  public constructor(
    protected readonly to: Caip19AssetId,
    protected readonly from: Caip19AssetId | null,
    protected readonly fromPrettyAmount: string,
    protected readonly setState: (state: TunnelServiceState) => void,
  ) {
    this.assetRef = Effect.runSync(
      SubscriptionRef.make<Caip19AssetId | null>(from),
    );
    this.amountRef = Effect.runSync(SubscriptionRef.make(fromPrettyAmount));

    Effect.runFork(this.init());
  }

  public setAsset(asset: Caip19AssetId | null) {
    Effect.runSync(
      SubscriptionRef.update(this.assetRef, (_) => {
        return asset;
      }),
    );
  }

  public setPrettyAmount(amount: string) {
    Effect.runSync(
      SubscriptionRef.update(this.amountRef, (_) => {
        return amount;
      }),
    );
  }

  protected init() {
    return Effect.gen(this, function* () {
      const simulation = Stream.zipLatest(
        this.assetRef.changes,
        this.amountRef.changes,
      ).pipe(
        Stream.map(([asset, prettyAmount]) => {
          const amount = Number.parseFloat(prettyAmount);
          if (asset !== null && !Number.isNaN(amount)) {
            return {
              asset,
              prettyAmount,
              shouldSimulate: true,
            } as const;
          }

          return {
            asset,
            prettyAmount,
            shouldSimulate: false,
          } as const;
        }),
        Stream.tap((params) => {
          if (params.shouldSimulate) {
            this.setState({
              status: "simulating",
              from: {
                asset: params.asset,
                prettyAmount: params.prettyAmount,
              },
              to: {
                asset: this.to,
              },
            });
          } else {
            this.setState({
              status: "idle",
              from: {
                asset: params.asset,
                prettyAmount: params.prettyAmount,
              },
            });
          }

          return Effect.void;
        }),
        Stream.filter((params) => {
          return params.shouldSimulate;
        }),
        Stream.debounce("1 second"),
      );

      yield* Stream.runForEach(simulation, (params) => {
        return Effect.gen(this, function* () {
          const fromAsset = yield* this.getAsset(params.asset);
          const toAsset = yield* this.getAsset(this.to);
          const fromAssetRawAmount = fromAsset
            ? fromAsset.prettyAmountToRawAmount(params.prettyAmount)
            : params.prettyAmount;

          const minAmount = fromAsset?.priceInfo?.usdValue
            ? 20 / parseFloat(fromAsset.priceInfo.usdValue)
            : 0;

          const nextState =
            parseFloat(params.prettyAmount) < minAmount
              ? {
                  status: "error" as const,
                  error: `Due to bridge costs, amounts under ${minAmount} LUNA are likely to temporarily fail.`,
                  from: {
                    asset: params.asset,
                    prettyAmount: params.prettyAmount,
                  },
                }
              : yield* pipe(
                  simulate({
                    from: {
                      asset: params.asset,
                      rawAmount: fromAssetRawAmount,
                    },
                    to: {
                      asset: this.to,
                    },
                    slippage: "5",
                  }),
                  Effect.match({
                    onFailure: (error): TunnelServiceState => {
                      return {
                        status: "error",
                        error,
                        from: {
                          asset: params.asset,
                          prettyAmount: params.prettyAmount,
                        },
                      };
                    },
                    onSuccess: (toRawAmount): TunnelServiceState => {
                      return {
                        status: "done",
                        from: {
                          prettyAmount: params.prettyAmount,
                          rawAmount: fromAssetRawAmount,
                          asset: params.asset,
                        },
                        to: {
                          rawAmount: toRawAmount,
                          prettyAmount: toAsset
                            ? toAsset.rawAmountToPrettyAmount(toRawAmount)
                            : toRawAmount,
                          asset: this.to,
                        },
                      };
                    },
                  }),
                );

          // Skip state update if the inputs changed in the meantime
          const currentAsset = yield* SubscriptionRef.get(this.assetRef);
          const currentPrettyAmount = yield* SubscriptionRef.get(
            this.amountRef,
          );
          if (
            currentAsset !== params.asset ||
            currentPrettyAmount !== params.prettyAmount
          ) {
            return;
          }

          this.setState(nextState);
        });
      });
    });
  }

  protected getAsset(assetId: Caip19AssetId) {
    return Effect.promise(async () => {
      const assetInfo = await AssetRegistry.getInstance().byId(assetId);
      return assetInfo ? new Asset(assetInfo) : null;
    });
  }
}
