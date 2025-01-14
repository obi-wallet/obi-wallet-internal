import { Caip19AssetId } from "@obi-wallet/sdk-caip";
import { Effect, Stream, SubscriptionRef } from "effect";

export interface TunnelServiceState {
  status: "idle" | "simulating" | "done";
  from: {
    asset: string;
    rawAmount: string;
  };
  to: {
    asset: string;
    rawAmount: string;
  };
}

export class TunnelService {
  protected assetRef: SubscriptionRef.SubscriptionRef<string>;
  protected amountRef: SubscriptionRef.SubscriptionRef<string>;

  constructor(
    protected readonly to: Caip19AssetId,
    protected readonly setState: (state: TunnelServiceState) => void,
  ) {
    this.assetRef = Effect.runSync(SubscriptionRef.make(""));
    this.amountRef = Effect.runSync(SubscriptionRef.make(""));

    Effect.runFork(this.init());
  }

  public setAsset(asset: string) {
    Effect.runSync(
      SubscriptionRef.update(this.assetRef, (_) => {
        return asset;
      }),
    );
  }

  public setRawAmount(amount: string) {
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
        Stream.map(([asset, rawAmount]) => {
          const amount = Number.parseFloat(rawAmount);
          const shouldSimulate = !Number.isNaN(amount);

          return {
            asset,
            rawAmount,
            amount,
            shouldSimulate,
          };
        }),
        Stream.tap((params) => {
          this.setState({
            status: params.shouldSimulate ? "simulating" : "idle",
            from: {
              asset: params.asset,
              rawAmount: params.rawAmount,
            },
            to: {
              asset: params.asset,
              rawAmount: params.rawAmount,
            },
          });
          return Effect.void;
        }),
        Stream.filter((params) => {
          return params.shouldSimulate;
        }),
        Stream.debounce("1 second"),
      );

      yield* Stream.runForEach(simulation, (params) => {
        // TODO: Depending on the selected asset, convert the amount to the correct unit

        // TODO: actually simulate
        return Effect.gen(this, function* () {
          console.log("SIMULATION", params);
          // Simulate a request that takes 1 second;
          yield* Effect.sleep("1 second");

          // Check if the inputs are still the same
          const currentAsset = yield* SubscriptionRef.get(this.assetRef);
          const currentRawAmount = yield* SubscriptionRef.get(this.amountRef);
          if (
            currentAsset !== params.asset ||
            currentRawAmount !== params.rawAmount
          ) {
            return Effect.void;
          }
          const simulationResponse: TunnelServiceState = {
            status: "done",
            from: {
              rawAmount: params.rawAmount,
              asset: params.asset,
            },
            to: {
              rawAmount: params.rawAmount,
              asset: this.to,
            },
          };
          this.setState(simulationResponse);
        });
      });
    });
  }
}
