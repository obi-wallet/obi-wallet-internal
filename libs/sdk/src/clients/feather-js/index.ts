import { isTxError, LCDClient, Msg, Tx } from "@terra-money/feather.js";
import {
  Pagination,
  PaginationOptions,
} from "@terra-money/feather.js/dist/client/lcd/APIRequester";
import { AxiosError } from "axios";
import { z } from "zod";

import { TerraChainId, terraChains } from "../../chains";
import { BroadcastTransactionResult, RpcError } from "../../sdk";
import { FeatherJsKey } from "../../sdk/common/feather-js";
import { Signer } from "../../signers";
import { Message, SignedTransaction } from "../../transactions";
import { AbstractClient } from "../abstract";

export async function withFeatherJsClient<T>(
  chainId: TerraChainId,
  f: (client: LCDClient) => T
) {
  let error;

  for (const lcd of terraChains[chainId].lcds) {
    try {
      return await f(
        new LCDClient({
          [chainId]: {
            lcd,
            chainID: chainId,
            gasAdjustment: 1.75,
            gasPrices: { uluna: 0.015 },
            prefix: "terra",
          },
        })
      );
    } catch (e) {
      const axiosError = e as AxiosError;
      const data = axiosError.response?.data;

      // Don't retry with other LCDs if the error is already an RPC error
      if (RpcError.safeParse(data).success) throw e;

      // Otherwise, silently retry with other LCDs
      error = e;
    }
  }

  // Propagate the last error if all LCDs failed
  throw error;
}

export class FeatherJsClient extends AbstractClient {
  public constructor(protected chainId: TerraChainId) {
    super();
  }

  public async fetchAllPages<T>(
    f: (
      paginationOptions: Partial<PaginationOptions>
    ) => Promise<[T[], Pagination]>
  ): Promise<T[]> {
    const result: T[] = [];
    let key: string | null = "";

    do {
      const [list, pagination] = await f({
        "pagination.limit": "100",
        "pagination.key": key,
      });

      result.push(...list);
      key = pagination?.next_key;
    } while (key);

    return result;
  }

  public withClient<T>(f: (client: LCDClient) => T) {
    return withFeatherJsClient(this.chainId, f);
  }

  public async queryContracts<T extends z.ZodTypeAny>(
    queries: {
      contract: string;
      query: unknown;
      schema: T;
    }[]
  ): Promise<z.infer<T>[]> {
    return await this.withClient(async (client) => {
      return await Promise.all(
        queries.map(async ({ contract, query, schema }) => {
          const response = await client.wasm.contractQuery(
            contract,
            query as string | object
          );
          return schema.parse(response);
        })
      );
    });
  }

  public async createAndSignTransaction({
    signer,
    messages,
  }: {
    signer: Signer;
    messages: Message[];
  }): Promise<SignedTransaction> {
    return await this.withClient(async (client) => {
      const key = FeatherJsKey.fromSigner(signer);
      const wallet = client.wallet(key);
      try {
        const transaction = await wallet.createAndSignTx({
          chainID: this.chainId,
          // TODO:
          msgs: messages as Msg[],
        });
        return transaction.toBytes();
      } catch (e) {
        const error = e as AxiosError;
        const data = error.response?.data;

        const result = RpcError.safeParse(data);
        if (result.success) {
          throw new Error(result.data.message);
        }

        throw e;
      }
    });
  }

  public async broadcastSignedTransaction(
    signedTransaction: SignedTransaction
  ): Promise<BroadcastTransactionResult> {
    return await this.withClient(async (client) => {
      const transaction = Tx.fromBuffer(Buffer.from(signedTransaction));
      const rawResult = await client.tx.broadcastBlock(
        transaction,
        this.chainId
      );
      return {
        success: !isTxError(rawResult),
        transactionHash: rawResult.txhash,
        rawLog: rawResult.raw_log,
        rawResult,
      };
    });
  }
}
