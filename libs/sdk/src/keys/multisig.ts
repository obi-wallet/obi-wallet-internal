import { Uint53 } from "@cosmjs/math";
import { encodePubkey } from "@cosmjs/proto-signing/build/pubkey";
import { LegacyAminoPubKey } from "cosmjs-types/cosmos/crypto/multisig/keys";
import { z } from "zod";

import { Secp256k1PublicKey } from "./sec256k1";

export const MultisigPublicKey = z.object({
  type: z.literal("tendermint/PubKeyMultisigThreshold"),
  value: z.object({
    threshold: z.string(),
    pubkeys: z.array(Secp256k1PublicKey),
  }),
});

export type MultisigPublicKey = z.infer<typeof MultisigPublicKey>;

// Class that wraps the type and provides the method
export class CombinedMultisigPublicKey {
  data: MultisigPublicKey;

  constructor(data: MultisigPublicKey) {
    this.data = data;
  }

  getCombinedPublicKey(): string {
    const pubkeyProto = LegacyAminoPubKey.fromPartial({
      threshold: Uint53.fromString(this.data.value.threshold).toNumber(),
      publicKeys: this.data.value.pubkeys.map(encodePubkey),
    });
    return Buffer.from(
      Uint8Array.from(LegacyAminoPubKey.encode(pubkeyProto).finish()),
    ).toString("base64");
  }
}
