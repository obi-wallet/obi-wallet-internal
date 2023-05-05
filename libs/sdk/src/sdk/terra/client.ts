import { LCDClient } from "@terra-money/feather.js";
import {
  Pagination,
  PaginationOptions,
} from "@terra-money/feather.js/dist/client/lcd/APIRequester";

import { TerraChainId } from "../../chains";
import { withTerraClient } from "../../clients";

export class TerraClient {
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
    return withTerraClient(this.chainId, f);
  }
}
