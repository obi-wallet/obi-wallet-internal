import { randomBytes } from "crypto";
import secp256k1 from "secp256k1";
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

export function generateSec256k1KeyPair(): Secp256k1KeyPair {
  const privateKeyBuffer = randomBytes(32);
  const publicKeyBuffer = secp256k1.publicKeyCreate(privateKeyBuffer);

  const privateKey = Buffer.from(privateKeyBuffer).toString("base64");
  const publicKey = Buffer.from(publicKeyBuffer).toString("base64");

  return {
    privateKey,
    publicKey: {
      type: "tendermint/PubKeySecp256k1",
      value: publicKey,
    },
  };
}
