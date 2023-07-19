import { z } from "zod";

import { BroadcastTransactionResult } from "../sdk";
import { Signer } from "../signers";
import { Message, SignedTransaction } from "../transactions";

export abstract class AbstractClient {
  public async queryContract<T extends z.ZodTypeAny>({
    contract,
    query,
    schema,
  }: {
    contract: string;
    query: unknown;
    schema: T;
  }): Promise<z.infer<T>> {
    const [response] = await this.queryContracts([{ contract, query, schema }]);
    return response;
  }

  public abstract queryContracts<T extends z.ZodTypeAny>(
    queries: {
      contract: string;
      query: unknown;
      schema: T;
    }[],
  ): Promise<z.infer<T>[]>;

  public abstract createAndSignTransaction({
    signer,
    messages,
  }: {
    signer: Signer;
    messages: Message[];
  }): Promise<SignedTransaction>;

  public abstract broadcastSignedTransaction(
    signedTransaction: SignedTransaction,
  ): Promise<BroadcastTransactionResult>;
}
