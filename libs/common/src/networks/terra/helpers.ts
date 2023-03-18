import { ObservableMultisigKey } from "@obi-wallet/sdk";
import {
  LegacyAminoMultisigPublicKey,
  SimplePublicKey,
} from "@terra-money/feather.js";

export function createMultisigPublicKey({
  multisigKey,
}: {
  multisigKey: ObservableMultisigKey;
}) {
  const publicKeys = [];

  for (const key of multisigKey.keys) {
    publicKeys.push(SimplePublicKey.fromAmino(key.publicKey));
  }

  return new LegacyAminoMultisigPublicKey(multisigKey.threshold, publicKeys);
}

export function getSigners({
  multisigKey,
}: {
  multisigKey: ObservableMultisigKey;
}) {
  const multisigPublicKey = createMultisigPublicKey({ multisigKey });

  return multisigPublicKey.pubkeys.map((publicKey, i) => {
    return {
      address: publicKey.address("terra"),
      ty: multisigKey.signerTypes[i],
    };
  });
}
