import { CosmosChain, withCosmosClients } from "@obi-wallet/sdk";

import { Coin } from "../common/types";

const LOOP_JUNO1_ADDRESS =
  "juno1qsrercqegvs4ye0yqg93knv73ye5dc3prqwd6jcdcuj8ggp6w0us66deup";

export async function fetchBalances({
  address,
  chainId,
}: {
  address: string;
  chainId: CosmosChain;
}): Promise<Coin[]> {
  return await withCosmosClients(
    chainId,
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
        const customTokens = [{ contract: LOOP_JUNO1_ADDRESS, denom: "uloop" }];

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
