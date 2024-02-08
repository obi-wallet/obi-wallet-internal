import { Uint53 } from "@cosmjs/math";
import { encodePubkey } from "@cosmjs/proto-signing/build/pubkey";
import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import { LegacyAminoPubKey } from "cosmjs-types/cosmos/crypto/multisig/keys";
import { z } from "zod";

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

export { Secp256k1PublicKey };
