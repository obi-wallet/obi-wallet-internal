import { Base64, Encoding } from "@obi-wallet/encoding";
import { randomBytes } from "crypto";
import { publicKeyConvert, publicKeyCreate } from "secp256k1";
import { z } from "zod";

export const Secp256k1PublicKey = z.object({
  type: z.literal("tendermint/PubKeySecp256k1"),
  value: Base64,
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
  const privateKeyU8 = base64Seed ?? new Uint8Array(randomBytes(32));
  const publicKeyU8 = publicKeyCreate(privateKeyU8);

  const privateKey = Encoding.fromBytes(privateKeyU8).toBase64();
  const publicKey = Encoding.fromBytes(publicKeyU8).toBase64();

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
  return publicKeyConvert(u8, true);
}

export function getSec256k1UncompressedPublicKey(
  publicKey: Secp256k1PublicKey,
) {
  const u8 = Buffer.from(publicKey.value, "base64");
  return publicKeyConvert(u8, false);
}
