import {
  LegacyAminoMultisigPublicKey,
  SimplePublicKey,
} from "@terra-money/feather.js";

import { MultisigKey } from "../../stores";

export function getAddress({
  publicKey,
}: {
  publicKey: SimplePublicKey.Amino;
}) {
  return SimplePublicKey.fromAmino(publicKey).address("terra");
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

export function getSigners({ multisigKey }: { multisigKey: MultisigKey }) {
  const multisigPublicKey = createMultisigPublicKey({ multisigKey });

  return multisigPublicKey.pubkeys.map((publicKey, i) => {
    return {
      address: publicKey.address("terra"),
      ty: multisigKey.signerTypes[i],
    };
  });
}
