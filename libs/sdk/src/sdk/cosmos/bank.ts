import { CosmosClient } from "./client";
import { CosmosChain } from "../../chains";
import { AbstractBankSdk } from "../abstract";
import { Coin } from "../common";

export class CosmosBankSdk extends AbstractBankSdk {
  protected client: CosmosClient;

  public constructor({
    chainId,
    client,
  }: {
    chainId: CosmosChain;
    client: CosmosClient;
  }) {
    super(chainId);
    this.client = client;
  }

  protected async balancesQueryFn(address: string): Promise<Coin[]> {
    return await this.client.withClients(
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
}
