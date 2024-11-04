import { ed25519 } from "@noble/curves/ed25519";
import { Base58EncodedString, Encoding } from "@obi-wallet/encoding";
import { z } from "zod";

export const Ed25519PublicKey = z.object({
  type: z.literal("tendermint/PubKeyEd25519"),
  value: Base58EncodedString,
});

export type Ed25519PublicKey = z.infer<typeof Ed25519PublicKey>;

export const Ed25519PrivateKey = Base58EncodedString;

export type Ed25519PrivateKey = z.infer<typeof Ed25519PrivateKey>;

export const Ed25519KeyPair = z.object({
  publicKey: Ed25519PublicKey,
  privateKey: Ed25519PrivateKey,
});

export type Ed25519KeyPair = z.infer<typeof Ed25519KeyPair>;

export function generateEd25519KeyPair(): Ed25519KeyPair {
  const privateKeyU8 = ed25519.utils.randomPrivateKey();
  const publicKeyU8 = ed25519.getPublicKey(privateKeyU8);

  const privateKey = Encoding.fromBytes(privateKeyU8).toBase58();
  const publicKey = Encoding.fromBytes(publicKeyU8).toBase58();

  return {
    privateKey,
    publicKey: {
      type: "tendermint/PubKeyEd25519",
      value: publicKey,
    },
  };
}
