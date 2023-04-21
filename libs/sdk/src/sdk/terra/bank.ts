import BigNumber from "bignumber.js";
import * as R from "ramda";
import invariant from "tiny-invariant";

import { TerraClient } from "./client";
import { tokenPairs } from "./token-pairs";
import { tokens } from "./tokens";
import { TerraChain } from "../../chains";
import { AbstractBankSdk } from "../abstract";
import { Coin } from "../common";

export class TerraBankSdk extends AbstractBankSdk {
  protected client: TerraClient;

  public constructor({
    chainId,
    client,
  }: {
    chainId: TerraChain;
    client: TerraClient;
  }) {
    super(chainId);
    this.client = client;
  }

  protected async balancesQueryFn(address: string): Promise<Coin[]> {
    return await this.client.withClient(async (client) => {
      const nativeCoins = await this.client.fetchAllPages(
        async (paginationOptions) => {
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
        }
      );

      const contractTokens = await Promise.all(
        Object.values(tokens).map(async (token) => {
          if (!R.has("token", token)) return null;

          const response = await client.wasm.contractQuery<{ balance: string }>(
            token.token,
            {
              balance: {
                address,
              },
            }
          );
          return {
            denom: R.has("symbol", token) ? token.symbol : token.protocol,
            contract: token.token,
            amount: response.balance,
          };
        })
      );

      return [...nativeCoins, ...contractTokens].filter(
        (coin): coin is Coin => {
          return coin !== null && coin.amount !== "0";
        }
      );
    });
  }

  protected async pricesQueryFn(): Promise<Record<string, number>> {
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
    const contractInfos = await Promise.all(
      allPairs.map(async (pair) => {
        switch (pair.dex) {
          case "astroport":
          case "terraswap":
          case "phoenix": {
            const response = await this.client.withClient(async (client) => {
              return (await client.wasm.contractQuery(pair.contract_addr, {
                pool: {},
              })) as {
                assets: { info: Asset; amount: string }[];
              };
            });
            return {
              ...pair,
              ...response,
            };
          }
        }
      })
    );

    while (stack.length > 0) {
      const item = stack.pop();
      if (!item) break;
      if (prices[item.denom]) continue;

      prices[item.denom] = item.usdPrice;
      const relevantPairs = contractInfos
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
        if (
          R.has(denom, prices) ||
          stack.find((item) => item.denom === denom)
        ) {
          continue;
        }

        const thisAsset = pair.assets.find((asset) => {
          return toDenom(asset.info) === item.denom;
        });
        const otherAsset = pair.assets.find((asset) => {
          return toDenom(asset.info) !== item.denom;
        });

        invariant(thisAsset, "thisAsset should exist");
        invariant(otherAsset, "otherAsset should exist");

        const price = item.usdPrice.times(
          new BigNumber(thisAsset.amount).div(otherAsset.amount)
        );

        if (price && !price.isNaN()) {
          stack.push({ denom, usdPrice: price });
        }
      }
    }

    return R.mapObjIndexed((price) => {
      return price.toNumber();
    }, prices);
  }
}
