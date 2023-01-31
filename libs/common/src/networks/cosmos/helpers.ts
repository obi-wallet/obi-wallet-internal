import { Pubkey, pubkeyToAddress } from "@cosmjs/amino";

import { CosmosChain, cosmosChains } from "../../chains";

export function getAddress({
  publicKey,
  chainId,
}: {
  publicKey: Pubkey;
  chainId: CosmosChain;
}) {
  return pubkeyToAddress(publicKey, cosmosChains[chainId].prefix);
}
