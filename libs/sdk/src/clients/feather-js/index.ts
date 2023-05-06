import { LCDClient } from "@terra-money/feather.js";
import {
  Pagination,
  PaginationOptions,
} from "@terra-money/feather.js/dist/client/lcd/APIRequester";
import { AxiosError } from "axios";

import { TerraChainId, terraChains } from "../../chains";
import { RpcError } from "../../sdk";

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

export class FeatherJsClient {
  public constructor(protected chainId: TerraChainId) {}

  public async fetchAllPages<T>(
    f: (
      paginationOptions: Partial<PaginationOptions>
    ) => Promise<[T[], Pagination]>
  ): Promise<T[]> {
    const result: T[] = [];
    let key: string | null = "";

    do {
      const [list, pagination] = (await f({
        "pagination.limit": "100",
        "pagination.key": key,
      })) as [T[], Pagination];

      result.push(...list);
      key = pagination?.next_key;
    } while (key);

    return result;
  }

  public withClient<T>(f: (client: LCDClient) => T) {
    return withFeatherJsClient(this.chainId, f);
  }
}
