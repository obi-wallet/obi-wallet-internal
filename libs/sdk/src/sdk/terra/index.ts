import { LCDClient } from "@terra-money/feather.js";
import BigNumber from "bignumber.js";
import * as R from "ramda";
import invariant from "tiny-invariant";

import { tokenPairs } from "./token-pairs";
import { TerraChain } from "../../chains";
import { withTerraClient } from "../../clients";
import { AbstractSdk } from "../abstract";

export class TerraSdk extends AbstractSdk {
  protected constructor(protected chainId: TerraChain) {
    super(chainId);
  }

  public async fetchPrices() {
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

    prices["foo"] = new BigNumber(1);

    while (stack.length > 0) {
      const item = stack.pop();
      if (!item) break;
      if (prices[item.denom]) continue;

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
                const response = await this.withClient(async (client) => {
                  return (await client.wasm.contractQuery(pair.contract_addr, {
                    pool: {},
                  })) as {
                    assets: { info: Asset; amount: string }[];
                  };
                });

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

  public withClient<T>(f: (client: LCDClient) => T) {
    return withTerraClient(this.chainId, f);
  }

  public static chainId(chainId: TerraChain) {
    return new TerraSdk(chainId);
  }
}
