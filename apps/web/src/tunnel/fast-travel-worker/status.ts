import { Effect, Schema } from "effect";

export function getTransactionsBy({
  publicKey,
  recipientAddress,
}:
  | {
      publicKey?: string | undefined;
      recipientAddress: string;
    }
  | {
      publicKey: string | undefined;
      recipientAddress?: string;
    }) {
  return Effect.gen(function* () {
    const url = new URL(
      `${process.env.FAST_TRAVEL_API_URL}/api/checkStatus?test=false`,
    );
    if (publicKey) {
      url.searchParams.set("pubkey", publicKey);
    } else if (recipientAddress) {
      url.searchParams.set("destinationAddress", recipientAddress);
    }
    const response = yield* Effect.tryPromise({
      try: async () => {
        return await fetch(url.toString());
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
    const transactions = yield* Effect.tryPromise({
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
      Schema.decodeUnknown(Schema.Array(Transaction))(transactions),
      {
        onSuccess: (transactions) => {
          return Effect.succeed(transactions);
        },
        onFailure: (error) => {
          return Effect.fail(`Failed to parse transactions: ${error.message}`);
        },
      },
    );
  });
}

const StepStatus = Schema.Struct({
  action: Schema.String,
});

const Transaction = Schema.Struct({
  transaction: Schema.Struct({
    deposit_address: Schema.String,
    status: Schema.String,
    intent: Schema.String,
    pubkey: Schema.String,
  }),
  step_statuses: Schema.Array(StepStatus),
});
