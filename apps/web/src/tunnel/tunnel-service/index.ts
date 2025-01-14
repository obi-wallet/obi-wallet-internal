import { Asset, AssetRegistry } from "@obi-wallet/sdk-asset-registry";
import { Caip19AssetId } from "@obi-wallet/sdk-caip";
import { Effect, Stream, SubscriptionRef } from "effect";

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

export type TunnelServiceState =
  | TunnelServiceStateIdle
  | TunnelServiceStateSimulating
  | TunnelServiceStateDone;

export class TunnelService {
  protected assetRef: SubscriptionRef.SubscriptionRef<Caip19AssetId | null>;
  protected amountRef: SubscriptionRef.SubscriptionRef<string>;

  public constructor(
    protected readonly to: Caip19AssetId,
    protected readonly setState: (state: TunnelServiceState) => void,
  ) {
    this.assetRef = Effect.runSync(
      SubscriptionRef.make<Caip19AssetId | null>(null),
    );
    this.amountRef = Effect.runSync(SubscriptionRef.make(""));

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

          // TODO: actually simulate
          console.log("SIMULATION", params);
          // Simulate a request that takes 1 second;
          yield* Effect.sleep("1 second");

          // Check if the inputs are still the same
          const currentAsset = yield* SubscriptionRef.get(this.assetRef);
          const currentPrettyAmount = yield* SubscriptionRef.get(
            this.amountRef,
          );
          if (
            currentAsset !== params.asset ||
            currentPrettyAmount !== params.prettyAmount
          ) {
            return Effect.void;
          }
          const simulationResponse: TunnelServiceState = {
            status: "done",
            from: {
              prettyAmount: params.prettyAmount,
              rawAmount: fromAssetRawAmount,
              asset: params.asset,
            },
            to: {
              rawAmount: fromAssetRawAmount,
              prettyAmount: toAsset
                ? toAsset.rawAmountToPrettyAmount(fromAssetRawAmount)
                : fromAssetRawAmount,
              asset: this.to,
            },
          };
          this.setState(simulationResponse);
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
