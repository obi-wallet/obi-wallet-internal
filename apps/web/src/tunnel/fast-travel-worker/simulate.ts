import { isSolanaChainId } from "@/target-chain/solana/chains";
import {
  Caip19AssetId,
  parseCaip19AssetId,
  parseCaip2ChainId,
} from "@obi-wallet/sdk-caip";
import { serialize } from "@obi-wallet/sdk-json";
import { Effect, pipe, Schema } from "effect";

export function simulate({
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
}): Effect.Effect<string, string> {
  return pipe(
    genericSimulateRequest({
      from,
      to: {
        asset: to.asset,
        address: "",
        // TODO: Fake pubkey, will be removed later
        publicKey: "AkDYMk/Avmkc8tFcfGOKOfFxETF0/g2v6IEg/Z1NnKLr",
      },
      slippage,
      simulateOnly: true,
    }),
    Effect.map(({ toRawAmount }) => {
      return toRawAmount;
    }),
  );
}

export function genericSimulateRequest({
  from,
  to,
  slippage,
  simulateOnly,
}: {
  from: {
    asset: Caip19AssetId;
    rawAmount: string;
  };
  to: {
    asset: Caip19AssetId;
    address: string;
    publicKey: string;
  };
  slippage: string;
  simulateOnly: boolean;
}): Effect.Effect<
  { depositAddress: string | null; toRawAmount: string },
  string
> {
  return Effect.gen(function* () {
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
        address: to.address,
      },
      pubkey: to.publicKey,
      slippage,
      simulateOnly,
    };
    const response = yield* Effect.tryPromise({
      try: async () => {
        return await fetch(
          `${process.env.NEXT_PUBLIC_FAST_TRAVEL_API_URL}/api/simulate`,
          {
            method: "POST",
            body: serialize(body),
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      },
      catch: (e) => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const error = e as Error;
        return `Failed to fetch: ${error.message}`;
      },
    });
    if (response.status !== 200) {
      const json = yield* Effect.tryPromise({
        try: () => {
          return response.json();
        },
        catch: (e) => {
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          const error = e as Error;
          return `Failed to parse JSON: ${error.message}`;
        },
      });
      return yield* Effect.fail(json === "Unknown error" ? json : json.error);
    }
    const simulationResponse = yield* Effect.tryPromise({
      try: () => {
        return response.json();
      },
      catch: (e) => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const error = e as Error;
        return `Failed to parse response JSON: ${error.message}`;
      },
    });
    return yield* Effect.matchEffect(
      parseSimulationResponse(simulationResponse),
      {
        onSuccess: ({ depositAddress, toRawAmount }) => {
          if (toRawAmount === null) {
            return Effect.fail("Failed to parse simulation response");
          }
          return Effect.succeed({ depositAddress, toRawAmount });
        },
        onFailure: (error) => {
          return Effect.fail(
            `Failed to parse simulation response: ${error.message}`,
          );
        },
      },
    );
  });
}

const JupiterSwapStrategy = Schema.Struct({
  JupiterSwapStrategy: Schema.Array(
    Schema.Struct({
      swapInfo: Schema.Struct({
        outAmount: Schema.String,
      }),
    }),
  ),
});

const SkipStrategy = Schema.Struct({
  SkipStrategy: Schema.Unknown,
});

const SquidStrategy = Schema.Struct({
  SquidStrategy: Schema.Unknown,
});

const UnknownStrategy = Schema.Record({
  key: Schema.String,
  value: Schema.Unknown,
});

const SimulationStrategyLeaf = Schema.Union(
  JupiterSwapStrategy.pipe(
    Schema.attachPropertySignature("kind", "JupiterSwapStrategy"),
  ),
  SkipStrategy.pipe(Schema.attachPropertySignature("kind", "SkipStrategy")),
  SquidStrategy.pipe(Schema.attachPropertySignature("kind", "SquidStrategy")),
  UnknownStrategy.pipe(
    Schema.attachPropertySignature("kind", "UnknownStrategy"),
  ),
);

const HybridStrategy = Schema.Struct({
  HybridStrategy: Schema.Array(SimulationStrategyLeaf),
});

const SimulationStrategy = Schema.Union(
  HybridStrategy.pipe(Schema.attachPropertySignature("kind", "HybridStrategy")),
  SimulationStrategyLeaf,
);

const SimulationResponse = Schema.Struct({
  response: Schema.Struct({
    deposit_address: Schema.NullOr(Schema.String),
  }),
  simulationOutput: SimulationStrategy,
});

export function parseSimulationResponse(response: unknown) {
  return Effect.gen(function* () {
    const decoded = yield* Schema.decodeUnknown(SimulationResponse)(response);
    return {
      depositAddress: decoded.response.deposit_address,
      toRawAmount: parseSimulationStrategy(decoded.simulationOutput),
    };
  });
}

export function parseSimulationStrategy(
  strategy: typeof SimulationStrategy.Type,
): string | null {
  switch (strategy.kind) {
    case "JupiterSwapStrategy":
      return parseJupiterSwapStrategy(strategy);
    case "HybridStrategy":
      return parseHybridStrategy(strategy);
    default:
      return null;
  }
}

export function parseHybridStrategy(strategy: typeof HybridStrategy.Type) {
  const lastStrategy =
    strategy.HybridStrategy[strategy.HybridStrategy.length - 1];
  return lastStrategy ? parseSimulationStrategy(lastStrategy) : null;
}

export function parseJupiterSwapStrategy(
  strategy: typeof JupiterSwapStrategy.Type,
): string | null {
  const lastStep =
    strategy.JupiterSwapStrategy[strategy.JupiterSwapStrategy.length - 1];
  return lastStep ? lastStep.swapInfo.outAmount : null;
}
