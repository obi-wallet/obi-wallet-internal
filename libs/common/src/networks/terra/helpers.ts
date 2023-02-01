import {
  LegacyAminoMultisigPublicKey,
  SimplePublicKey,
} from "@terra-money/terra.js";

import { MultisigKey } from "../../stores";

export function getAddress({
  publicKey,
}: {
  publicKey: SimplePublicKey.Amino;
}) {
  return SimplePublicKey.fromAmino(publicKey).address();
}

export function createMultisigPublicKey({
  multisigKey,
}: {
  multisigKey: MultisigKey;
}) {
  const publicKeys = [];

  for (const key of multisigKey.keys) {
    publicKeys.push(SimplePublicKey.fromAmino(key.payload.publicKey));
  }

  return new LegacyAminoMultisigPublicKey(multisigKey.threshold, publicKeys);
}
