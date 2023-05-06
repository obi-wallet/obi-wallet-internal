import BigNumber from "bignumber.js";
import * as R from "ramda";
import invariant from "tiny-invariant";

import { TerraChainId } from "../../../chains";
import { FeatherJsClient } from "../../../clients";
import { EnrichedToken, Token } from "../../common";
import { AbstractBankSdk } from "../abstract";

export interface TokenRegistryEntry {
  base_denom?: string;
  denom?: string;
  name?: string;
  symbol?: string;
  icon?: string;
  token?: string;
  decimals: number;
}

export type TokenRegistry = Record<string, TokenRegistryEntry>;

type Asset =
  | { token: { contract_addr: string } }
  | { native_token: { denom: string } };

export interface TokenPairRegistryEntry {
  asset_infos: Asset[];
  contract_addr: string;
  dex: string;
}

export type TokenPairRegistry = Record<string, TokenPairRegistryEntry>;

export class FeatherJsBankSdk extends AbstractBankSdk {
  protected client: FeatherJsClient;
  protected tokens: TokenRegistry;
  protected tokenPairs: TokenPairRegistry;
  protected usdTokens: string[];

  public constructor({
    chainId,
    client,
    tokens,
    tokenPairs,
    usdTokens,
  }: {
    chainId: TerraChainId;
    client: FeatherJsClient;
    tokens: TokenRegistry;
    tokenPairs: TokenPairRegistry;
    usdTokens: string[];
  }) {
    super(chainId);
    this.client = client;
    this.tokens = tokens;
    this.tokenPairs = tokenPairs;
    this.usdTokens = usdTokens;
  }

  protected async balancesQueryFn(address: string): Promise<Token[]> {
    return await this.client.withClient(async (client) => {
      const nativeCoins = await this.client.fetchAllPages(
        async (paginationOptions) => {
          const [coins, pagination] = await client.bank.balance(
            address,
            paginationOptions
          );
          return [
            coins.map((coin): Token => {
              return {
                id: coin.denom,
                rawAmount: coin.amount.toString(),
              };
            }),
            pagination,
          ];
        }
      );

      const contractTokens = await Promise.all(
        Object.values(this.tokens).map(async (token) => {
          if (!token.token) return null;

          const response = await client.wasm.contractQuery<{ balance: string }>(
            token.token,
            {
              balance: {
                address,
              },
            }
          );
          return {
            id: token.token,
            rawAmount: response.balance,
          };
        })
      );

      return [...nativeCoins, ...contractTokens].filter(
        (coin): coin is Token => {
          return coin !== null && coin.rawAmount !== "0";
        }
      );
    });
  }

  protected async pricesQueryFn(): Promise<Record<string, number>> {
    const stack = this.usdTokens.map((denom) => {
      return {
        denom,
        usdPrice: new BigNumber(1),
      };
    });

    const prices: Record<string, BigNumber> = {};

    type Asset =
      | { token: { contract_addr: string } }
      | { native_token: { denom: string } };

    function toDenom(asset: Asset) {
      return "token" in asset
        ? asset.token.contract_addr
        : asset.native_token.denom;
    }

    const allPairs = R.values(this.tokenPairs);
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
          default:
            throw new Error("Unsupported dex");
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

  public enrichTokenWithoutUsdValue(token: Token): EnrichedToken {
    if (!R.has(token.id, this.tokens)) {
      return super.enrichTokenWithoutUsdValue(token);
    }

    const tokenData = this.tokens[token.id as keyof typeof this.tokens];
    const denom =
      tokenData.base_denom ?? tokenData.denom ?? tokenData.symbol ?? token.id;

    return {
      ...token,
      amount: parseInt(token.rawAmount, 10) / 10 ** tokenData.decimals,
      icon: tokenData.icon ? tokenData.icon : null,
      contract: R.prop("token", tokenData) ?? null,
      denom: (() => {
        if (denom.startsWith("u")) {
          return denom.slice(1).toUpperCase();
        }
        return denom;
      })(),
      digits: tokenData.decimals,
      label: tokenData.name ?? tokenData.symbol ?? token.id,
      usdValue: null,
    };
  }
}
