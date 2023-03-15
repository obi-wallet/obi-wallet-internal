import { CosmWasmClient, JsonObject } from "@cosmjs/cosmwasm-stargate";
import { StargateClient } from "@cosmjs/stargate";
import * as R from "ramda";
import warning from "tiny-warning";

import { CosmosChain, cosmosChains } from "../../chains";
import {
  withCosmosClients,
  withCosmosCosmWasmClient,
  withCosmosStargateClient,
} from "../../clients";
import { AbstractSdk } from "../abstract";
import { Coin } from "../common";

export class CosmosSdk extends AbstractSdk {
  protected constructor(protected chainId: CosmosChain) {
    super(chainId);
  }

  public get chain() {
    return cosmosChains[this.chainId];
  }

  public async fetchPrices() {
    return await this.withCosmWasmClient(async (cosmWasmClient) => {
      const denoms = (() => {
        switch (this.chainId) {
          case "uni-3":
            return ["ujuno"];
          case "juno-1":
            return [
              "ujuno",
              "ibc/EAC38D55372F38F1AFD68DF7FE9EF762DCF69F26520643CF3F9D292A738D8034",
              "uloop",
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
              case "uloop": //LOOP
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

  public async fetchBalances({ address }: { address: string }) {
    return await this.withClients(
      async ({ stargateClient, cosmWasmClient }) => {
        const [nativeBalances, customBalances] = await Promise.all([
          fetchNativeBalances(),
          fetchCustomBalances(),
        ]);
        return [...nativeBalances, ...customBalances];

        async function fetchNativeBalances() {
          const coins = await stargateClient.getAllBalances(address);
          return coins.map((coin: Coin) => {
            return {
              denom: coin.denom,
              amount: coin.amount,
              usdPrice: 0,
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
                denom: customToken.denom,
                amount: response.balance,
                contract: customToken.contract,
              };
            })
          );
        }
      }
    );
  }

  public async fetchDelegations(_: { address: string }) {
    warning(true, "fetchDelegations not implemented for Cosmos");
    return [];
  }

  public async fetchUnbondingDelegations(_: { address: string }) {
    warning(true, "fetchUnbondingDelegations not implemented for Cosmos");
    return [];
  }

  public async fetchValidators() {
    warning(true, "fetchValidators not implemented for Cosmos");
    return [];
  }

  public async fetchRewards(_: { address: string }) {
    warning(true, "fetchRewards not implemented for Cosmos");
    return {
      perDelegator: [],
      total: {
        denom: this.chain.denom,
        amount: "0",
      },
    };
  }

  public async fetchCodeId({ contract }: { contract: string }) {
    return await this.withCosmWasmClient(async (client) => {
      const { codeId } = await client.getContract(contract);
      return codeId;
    });
  }

  public withCosmWasmClient<T>(f: (client: CosmWasmClient) => T) {
    return withCosmosCosmWasmClient(this.chainId, f);
  }

  public withStargateClient<T>(f: (client: StargateClient) => T) {
    return withCosmosStargateClient(this.chainId, f);
  }

  public withClients<T>(
    f: (clients: {
      stargateClient: StargateClient;
      cosmWasmClient: CosmWasmClient;
    }) => T
  ) {
    return withCosmosClients(this.chainId, f);
  }

  public static chainId(chainId: CosmosChain) {
    return new CosmosSdk(chainId);
  }
}
