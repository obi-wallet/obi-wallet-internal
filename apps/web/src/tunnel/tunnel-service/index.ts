import { isSolanaChainId } from "@/target-chain/solana/chains";
import { Asset, AssetRegistry } from "@obi-wallet/sdk-asset-registry";
import {
  Caip19AssetId,
  parseCaip19AssetId,
  parseCaip2ChainId,
} from "@obi-wallet/sdk-caip";
import { serialize } from "@obi-wallet/sdk-json";
import { Effect, Stream, SubscriptionRef } from "effect";
import { findLast } from "ramda";

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

          const response = yield* Effect.promise(async () => {
            return await this.simulate({
              from: {
                asset: params.asset,
                rawAmount: fromAssetRawAmount,
              },
              to: {
                asset: this.to,
              },
              slippage: "5",
            });
          });

          // Check if the inputs are still the same
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

          if (response.success) {
            const toRawAmount = response.rawAmount;
            const simulationResponse: TunnelServiceState = {
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
            this.setState(simulationResponse);
          } else {
            this.setState({
              status: "error",
              error: response.error,
              from: {
                asset: params.asset,
                prettyAmount: params.prettyAmount,
              },
            });
          }
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

  protected async simulate({
    from,
    to,
    slippage,
  }: {
    from: {
      asset: Caip19AssetId;
      rawAmount: string;
    };
    to: {
      asset: Caip19AssetId;
    };
    slippage: string;
  }): Promise<
    | {
        success: true;
        rawAmount: string;
      }
    | {
        success: false;
        error: string;
      }
  > {
    const parsedFrom = parseCaip19AssetId(from.asset);
    const parsedFromChain = parseCaip2ChainId(parsedFrom.chainId);
    const parsedTo = parseCaip19AssetId(to.asset);
    const parsedToChain = parseCaip2ChainId(parsedTo.chainId);

    const body = {
      from: {
        chainId: parsedFromChain.reference,
        asset: parsedFrom.reference,
        amount: from.rawAmount,
      },
      to: {
        chainId: isSolanaChainId(parsedTo.chainId)
          ? "solana"
          : parsedToChain.reference,
        asset: parsedTo.reference,
      },
      // TODO: Fake pubkey, will be removed later
      pubkey: "AkDYMk/Avmkc8tFcfGOKOfFxETF0/g2v6IEg/Z1NnKLr",
      slippage,
      simulateOnly: true,
    };
    const response = await fetch(
      "https://fast-travel-ts-worker-git-staging-obi-money.vercel.app/api/simulate",
      {
        method: "POST",
        body: serialize(body),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (response.status !== 200) {
      try {
        const json = await response.json();
        if ("error" in json) {
          return {
            success: false,
            error: json.error,
          };
        }
      } catch {
        return {
          success: false,
          error: "Failed to simulate",
        };
      }
    }

    // TODO: schema
    const { simulationOutput } = await response.json();
    const parseSimulationOutput = (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      simulationOutput: any,
    ): {
      swapInfo: {
        outAmount: string;
      };
    } => {
      if (simulationOutput === null) {
        return simulationOutput;
      }
      if (Array.isArray(simulationOutput)) {
        return parseSimulationOutput(
          findLast((step) => {
            const keys = Object.keys(step);
            if (keys.length === 1) {
              return keys[0] !== "FinalTransfer";
            }
            return true;
          }, simulationOutput),
        );
      }
      const keys = Object.keys(simulationOutput);
      if (keys.length === 1 && keys[0]) {
        return parseSimulationOutput(simulationOutput[keys[0]]);
      }
      return simulationOutput;
    };
    const foo = parseSimulationOutput(simulationOutput);
    return {
      success: true,
      rawAmount: foo.swapInfo.outAmount,
    };
  }
}
