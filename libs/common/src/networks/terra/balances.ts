import { TerraChain, terraChains, withTerraClient } from "@obi-wallet/sdk";
import { Coins } from "@terra-money/feather.js";
import {
  Pagination,
  PaginationOptions,
} from "@terra-money/feather.js/dist/client/lcd/APIRequester";
import * as R from "ramda";

import { Rewards } from "../common/types";

export async function fetchRewards({
  address,
  chainId,
}: {
  address: string;
  chainId: TerraChain;
}): Promise<Rewards> {
  return await withTerraClient(chainId, async (client) => {
    const rewards = await client.distribution.rewards(address);

    const handleRewards = (coins: Coins) => {
      const mapped = coins.map((coin) => {
        return {
          denom: coin.denom,
          amount: coin.amount.toString(),
        };
      });
      return mapped.length > 0
        ? mapped[0]
        : {
            denom: terraChains[chainId].denom,
            amount: "0",
          };
    };

    const perDelegator = R.values(
      R.mapObjIndexed((rewards, address) => {
        return {
          address,
          rewards: handleRewards(rewards),
        };
      }, rewards.rewards)
    );
    const total = handleRewards(rewards.total);

    return {
      perDelegator,
      total,
    };
  });
}

async function fetchAll<T>(
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
