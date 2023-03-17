import {
  LegacyAminoMultisigPublicKey,
  SimplePublicKey,
} from "@terra-money/feather.js";

import { MultisigKey } from "../../stores";

export function createMultisigPublicKey({
  multisigKey,
}: {
  multisigKey: MultisigKey;
}) {
  const publicKeys = [];

  for (const key of multisigKey.get().keys) {
    publicKeys.push(SimplePublicKey.fromAmino(key.publicKey));
  }

  return new LegacyAminoMultisigPublicKey(
    multisigKey.get().threshold,
    publicKeys
  );
}

export function getSigners({ multisigKey }: { multisigKey: MultisigKey }) {
  const multisigPublicKey = createMultisigPublicKey({ multisigKey });

  return multisigPublicKey.pubkeys.map((publicKey, i) => {
    return {
      address: publicKey.address("terra"),
      ty: multisigKey.get().signerTypes[i],
    };
  });
}
