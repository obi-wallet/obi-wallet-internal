import { LCDClient } from "@terra-money/terra.js";

import { terraChains, TerraChain } from "../chains";

export async function withLcdClient<T>(
  chainId: TerraChain,
  f: (client: LCDClient) => T
) {
  let error;

  for (const lcd of terraChains[chainId].lcds) {
    try {
      return await f(new LCDClient({ URL: lcd, chainID: chainId }));
    } catch (e) {
      // Silently retry with other LCDs
      error = e;
    }
  }

  // Propagate the last error if all LCDs failed
  throw error;
}
