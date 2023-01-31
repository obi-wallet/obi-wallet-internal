import { SimplePublicKey } from "@terra-money/terra.js";

export function getAddress({
  publicKey,
}: {
  publicKey: SimplePublicKey.Amino;
}) {
  return SimplePublicKey.fromAmino(publicKey).address();
}
