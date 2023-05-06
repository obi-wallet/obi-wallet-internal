import { JsonObject } from "@cosmjs/cosmwasm-stargate";
import * as R from "ramda";

import { LegacyCosmosChainId, legacyCosmosChains } from "../../chains";
import { CosmJsClient } from "../../clients";
import { AbstractBankSdk } from "../abstract";
import { EnrichedToken, Token } from "../common";

export class LegacyCosmosBankSdk extends AbstractBankSdk {
  protected chainId: LegacyCosmosChainId;
  protected client: CosmJsClient;

  public constructor({
    chainId,
    client,
  }: {
    chainId: LegacyCosmosChainId;
    client: CosmJsClient;
  }) {
    super(chainId);
    this.chainId = chainId;
    this.client = client;
  }

  protected async balancesQueryFn(address: string): Promise<Token[]> {
    return await this.client.withClients(
      async ({ stargateClient, cosmWasmClient }) => {
        const [nativeBalances, customBalances] = await Promise.all([
          fetchNativeBalances(),
          fetchCustomBalances(),
        ]);
        return [...nativeBalances, ...customBalances];

        async function fetchNativeBalances() {
          const coins = await stargateClient.getAllBalances(address);
          return coins.map((coin) => {
            return {
              id: coin.denom,
              rawAmount: coin.amount,
            };
          });
        }

        async function fetchCustomBalances() {
          const customTokens = [
            {
              contract:
                "juno1qsrercqegvs4ye0yqg93knv73ye5dc3prqwd6jcdcuj8ggp6w0us66deup",
              denom: "uloop",
            },
          ];

          return await Promise.all(
            customTokens.map(async (customToken) => {
              const response = await cosmWasmClient.queryContractSmart(
                customToken.contract,
                {
                  balance: { address: address },
                }
              );
              return {
                id: customToken.contract,
                rawAmount: response.balance,
              };
            })
          );
        }
      }
    );
  }

  protected async pricesQueryFn(): Promise<Record<string, number>> {
    return await this.client.withCosmWasmClient(async (cosmWasmClient) => {
      const denoms = (() => {
        switch (this.chainId) {
          case "uni-3":
            return ["ujuno"];
          case "juno-1":
            return [
              "ujuno",
              "ibc/EAC38D55372F38F1AFD68DF7FE9EF762DCF69F26520643CF3F9D292A738D8034",
              "juno1qsrercqegvs4ye0yqg93knv73ye5dc3prqwd6jcdcuj8ggp6w0us66deup",
            ];
        }
      })();

      const getContractRoute = (denom: string) => {
        switch (this.chainId) {
          case "uni-3":
            return [
              "juno1dmwfwqvke4hew5s93ut8h4tgu6sxv67zjw0y3hskgkfpy3utnpvseqyjs7",
            ];
          case "juno-1":
            switch (denom) {
              case "ujuno":
                return [
                  "juno1ctsmp54v79x7ea970zejlyws50cj9pkrmw49x46085fn80znjmpqz2n642",
                ]; // needs to be juno type
              case "ibc/EAC38D55372F38F1AFD68DF7FE9EF762DCF69F26520643CF3F9D292A738D8034":
                return []; //axlUSDC
              case "juno1qsrercqegvs4ye0yqg93knv73ye5dc3prqwd6jcdcuj8ggp6w0us66deup": //LOOP
                return [
                  "",
                  "juno1utkr0ep06rkxgsesq6uryug93daklyd6wneesmtvxjkz0xjlte9qdj2s8q",
                ];
            }
        }
        return null;
      };

      const getUsdRate = async (denom: string) => {
        const route = getContractRoute(denom);

        if (!route) return 0;
        if (route.length === 0) return 10 ** 6;

        let dexBasePriceElements: JsonObject;

        let dexBasePrice: number;
        if (
          route[0] ===
          "juno1ctsmp54v79x7ea970zejlyws50cj9pkrmw49x46085fn80znjmpqz2n642"
        ) {
          dexBasePriceElements = await cosmWasmClient.queryContractSmart(
            route[0],
            {
              token1_for_token2_price: {
                token1_amount: "10000000",
              },
            }
          );
          dexBasePrice = Number(dexBasePriceElements.token2_amount) / 10;
        } else if (route[0] !== "") {
          dexBasePriceElements = await cosmWasmClient.queryContractSmart(
            route[0],
            {
              simulation: {
                offer_asset: {
                  amount: "10000000", // force 10 for now, but may have slippage or other issues with assets
                  info: {
                    native_token: { denom: denom },
                  },
                },
              },
            }
          );
          dexBasePrice =
            (Number(dexBasePriceElements.commissionAmount) +
              Number(dexBasePriceElements.returnAmount)) /
            10;
        } else {
          if (route.length === 0) {
            console.error("No price route found for " + denom);
          }
          dexBasePrice = 1000000;
        }

        if (route.length === 1) {
          // is base asset
          return dexBasePrice;
        }
        try {
          const basePriceInUsdElements =
            await cosmWasmClient.queryContractSmart(route[1], {
              reverse_simulation: {
                ask_asset: {
                  amount: "10000000", //$10
                  info: {
                    native_token: {
                      denom:
                        "ibc/EAC38D55372F38F1AFD68DF7FE9EF762DCF69F26520643CF3F9D292A738D8034",
                    },
                  },
                },
              },
            });
          const basePrice =
            Number(basePriceInUsdElements.commission_amount) +
            Number(basePriceInUsdElements.offer_amount);
          return (dexBasePrice * 10000000) / basePrice;
        } catch (e) {
          console.error("Price query failed");
          return 0;
        }
      };

      return R.fromPairs(
        await Promise.all(
          denoms.map(async (denom) => {
            return [denom, (await getUsdRate(denom)) / 10 ** 6];
          })
        )
      );
    });
  }

  protected enrichTokenWithoutUsdValue(token: Token): EnrichedToken {
    switch (token.id) {
      case this.chain.denom: {
        const digits = 6;
        return {
          ...token,
          amount: parseInt(token.rawAmount, 10) / 10 ** digits,
          contract: null,
          icon: null,
          denom: this.chain.denom.slice(1).toUpperCase(),
          digits,
          label: this.chain.denom[1].toUpperCase() + this.chain.denom.slice(2),
          usdValue: null,
        };
      }
      case "ibc/EAC38D55372F38F1AFD68DF7FE9EF762DCF69F26520643CF3F9D292A738D8034": {
        const digits = 6;
        return {
          ...token,
          amount: parseInt(token.rawAmount, 10) / 10 ** digits,
          contract: null,
          icon: null,
          denom: "axlUSDC",
          digits,
          label: "USDC (Axelar)",
          usdValue: null,
        };
      }
      case "juno1qsrercqegvs4ye0yqg93knv73ye5dc3prqwd6jcdcuj8ggp6w0us66deup": {
        const digits = 6;
        return {
          ...token,
          amount: parseInt(token.rawAmount, 10) / 10 ** digits,
          contract:
            "juno1qsrercqegvs4ye0yqg93knv73ye5dc3prqwd6jcdcuj8ggp6w0us66deup",
          icon: null,
          denom: "LOOP",
          digits,
          label: "Loop",
          usdValue: null,
        };
      }
      default:
        return super.enrichToken(token);
    }
  }

  protected get chain() {
    return legacyCosmosChains[this.chainId];
  }
}
