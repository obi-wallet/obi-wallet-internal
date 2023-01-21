import { LCDClient } from "@terra-money/terra.js";

import { terraChains, TerraChain } from "../chains";

// TODO: handle multiple lcds
export function createLcdClient(chainId: TerraChain) {
  const { lcd } = terraChains[chainId];
  return new LCDClient({
    URL: lcd,
    chainID: chainId,
  });
}
