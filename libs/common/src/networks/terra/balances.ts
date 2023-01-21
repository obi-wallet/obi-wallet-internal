import {
  Pagination,
  PaginationOptions,
} from "@terra-money/terra.js/dist/client/lcd/APIRequester";
import BigNumber from "bignumber.js";
import * as R from "ramda";
import invariant from "tiny-invariant";

import { TerraChain } from "../../chains";
import { createLcdClient } from "../../clients";
import { Coin } from "../../stores/balances/abstract-balances-store";
import { tokenPairs } from "./token-pairs";

// TODO: move somewhere else

export async function fetchPrices({ chainId }: { chainId: TerraChain }) {
  const client = createLcdClient(chainId);
  const stack: { denom: string; usdPrice: BigNumber }[] = [
    {
      // axlUSDC
      denom:
        "ibc/B3504E092456BA618CC28AC671A71FB08C6CA0FD0BE7C8A5B5A3E2DD933CC9E4",
      usdPrice: new BigNumber(1),
    },
    {
      // axlUSDT
      denom:
        "ibc/CBF67A2BCF6CAE343FDF251E510C8E18C361FC02B23430C121116E0811835DEF",
      usdPrice: new BigNumber(1),
    },
  ];

  const prices: Record<string, BigNumber> = {};

  type Asset =
    | { token: { contract_addr: string } }
    | { native_token: { denom: string } };

  function toDenom(asset: Asset) {
    return "token" in asset
      ? asset.token.contract_addr
      : asset.native_token.denom;
  }

  const allPairs = R.values(tokenPairs) as {
    asset_infos: Asset[];
    contract_addr: string;
    dex: "astroport" | "terraswap" | "phoenix";
  }[];

  while (stack.length > 0) {
    const item = stack.pop();
    if (!item) break;
    if (R.has(item.denom, prices)) continue;

    // @ts-expect-error Not sure why TS doesn't like it
    prices[item.denom] = item.usdPrice;

    const relevantPairs = allPairs
      .filter((pair) => {
        return pair.asset_infos.find((asset) => {
          return toDenom(asset) === item.denom;
        });
      })
      .map((pair) => {
        const otherAsset = pair.asset_infos.find((asset) => {
          return toDenom(asset) !== item.denom;
        });

        invariant(otherAsset, "otherAsset should exist");

        return {
          denom: toDenom(otherAsset),
          pair,
        };
      });

    for (const { denom, pair } of relevantPairs) {
      if (R.has(denom, prices) || stack.find((item) => item.denom === denom))
        continue;
      const price = await (async () => {
        try {
          switch (pair.dex) {
            case "astroport":
            case "terraswap":
            case "phoenix": {
              const response = (await client.wasm.contractQuery(
                pair.contract_addr,
                {
                  pool: {},
                }
              )) as { assets: { info: Asset; amount: string }[] };

              const thisAsset = response.assets.find((asset) => {
                return toDenom(asset.info) === item.denom;
              });
              const otherAsset = response.assets.find((asset) => {
                return toDenom(asset.info) !== item.denom;
              });

              invariant(thisAsset, "thisAsset should exist");
              invariant(otherAsset, "otherAsset should exist");

              return item.usdPrice.times(
                new BigNumber(thisAsset.amount).div(otherAsset.amount)
              );
            }
          }
        } catch (e) {
          console.log(e);
        }

        return null;
      })();

      if (price && !price.isNaN()) {
        stack.push({ denom, usdPrice: price });
      }
    }
  }

  return R.mapObjIndexed((price) => {
    return price.toNumber();
  }, prices);
}

export async function fetchBalances({
  address,
  chainId,
}: {
  address: string;
  chainId: TerraChain;
}): Promise<Coin[]> {
  const client = createLcdClient(chainId);
  return await fetchAll(async (paginationOptions) => {
    const [coins, pagination] = await client.bank.balance(
      address,
      paginationOptions
    );
    return [
      coins.map((coin): Coin => {
        return {
          denom: coin.denom,
          amount: coin.amount.toString(),
        };
      }),
      pagination,
    ];
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
