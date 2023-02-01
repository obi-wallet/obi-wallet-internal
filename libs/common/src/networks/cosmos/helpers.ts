import {
  createMultisigThresholdPubkey,
  Pubkey,
  pubkeyToAddress,
} from "@cosmjs/amino";

import { CosmosChain, cosmosChains } from "../../chains";
import { MultisigKey } from "../../stores";

export function getAddress({
  publicKey,
  chainId,
}: {
  publicKey: Pubkey;
  chainId: CosmosChain;
}) {
  return pubkeyToAddress(publicKey, cosmosChains[chainId].prefix);
}

export function createMultisigPublicKey({
  multisigKey,
}: {
  multisigKey: MultisigKey;
}) {
  const publicKeys = [];

  for (const key of multisigKey.keys) {
    publicKeys.push(key.payload.publicKey);
  }

  return createMultisigThresholdPubkey(publicKeys, multisigKey.threshold);
}
