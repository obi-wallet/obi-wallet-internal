import { isSolanaChainId } from "@/target-chain/solana/chains";
import {
  Caip19AssetId,
  parseCaip19AssetId,
  parseCaip2ChainId,
} from "@obi-wallet/sdk-caip";
import { serialize } from "@obi-wallet/sdk-json";
import { Effect, pipe } from "effect";
import { findLast } from "ramda";

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
    const e = Effect.tryPromise({
      try: async () => {
        return await fetch(
          "https://fast-travel-ts-worker-git-staging-obi-money.vercel.app/api/simulate",
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
    const response = yield* e;
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
    // TODO: schema
    const { simulationOutput, deposit_address } = yield* Effect.tryPromise({
      try: () => {
        return response.json();
      },
      catch: (e) => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const error = e as Error;
        return `Failed to parse response JSON: ${error.message}`;
      },
    });
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
    const output = parseSimulationOutput(simulationOutput);
    return yield* Effect.succeed({
      depositAddress: deposit_address,
      toRawAmount: output.swapInfo.outAmount,
    });
  });
}
