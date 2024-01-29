import { randomBytes } from "crypto";
import * as secp256k1 from "secp256k1";
import { z } from "zod";

export const Secp256k1PublicKey = z.object({
  type: z.literal("tendermint/PubKeySecp256k1"),
  value: z.string(),
});

export type Secp256k1PublicKey = z.infer<typeof Secp256k1PublicKey>;

export const Sec256k1PrivateKey = z.string();

export type Sec256k1PrivateKey = z.infer<typeof Sec256k1PrivateKey>;

export interface Secp256k1KeyPair {
  publicKey: Secp256k1PublicKey;
  privateKey: Sec256k1PrivateKey;
}

export function generateSec256k1KeyPair(
  base64Seed?: Uint8Array,
): Secp256k1KeyPair {
  // use base64Seed to create 32 random bytes
  const privateKeyU8 = base64Seed ?? randomBytes(32);
  const publicKeyU8 = secp256k1.publicKeyCreate(privateKeyU8);

  const privateKey = Buffer.from(privateKeyU8).toString("base64");
  const publicKey = Buffer.from(publicKeyU8).toString("base64");

  return {
    privateKey,
    publicKey: {
      type: "tendermint/PubKeySecp256k1",
      value: publicKey,
    },
  };
}

export function getSec256k1CompressedPublicKey(publicKey: Secp256k1PublicKey) {
  const u8 = Buffer.from(publicKey.value, "base64");
  return secp256k1.publicKeyConvert(u8, true);
}
