import { LCDClient } from "@terra-money/terra.js";

import { terraChains, TerraChain } from "../chains";

// TODO: handle multiple rpcs
export function createLcdClient(chainId: TerraChain) {
  const { rpcs } = terraChains[chainId];
  for (const rpc of rpcs) {
    try {
      return new LCDClient({
        URL: rpc,
        chainID: chainId,
      });
    } catch (e) {
      console.error(e);
    }
  }
  throw new Error("No RPC connected");
}
