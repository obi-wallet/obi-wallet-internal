import { LCDClient } from "@terra-money/feather.js";
import { AxiosError } from "axios";

import { TerraChain, terraChains } from "../chains";
import { RpcError } from "../sdk";

export async function withTerraClient<T>(
  chainId: TerraChain,
  f: (client: LCDClient) => T
) {
  let error;

  for (const lcd of terraChains[chainId].lcds) {
    try {
      return await f(
        new LCDClient({
          [chainId]: {
            lcd,
            chainID: chainId,
            gasAdjustment: 1.75,
            gasPrices: { uluna: 0.015 },
            prefix: "terra",
          },
        })
      );
    } catch (e) {
      const axiosError = e as AxiosError;
      const data = axiosError.response?.data;

      // Don't retry with other LCDs if the error is already an RPC error
      if (RpcError.safeParse(data).success) throw e;

      // Otherwise, silently retry with other LCDs
      error = e;
    }
  }

  // Propagate the last error if all LCDs failed
  throw error;
}
