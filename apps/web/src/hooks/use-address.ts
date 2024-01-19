import { usePublicKey } from "@/hooks/use-public-key";
import { ethers } from "ethers";
import secp256k1 from "secp256k1";
import { pubkeyToAddress } from "secretjs";

export function useCosmosAddress(prefix: string) {
  const publicKey = usePublicKey();

  if (!publicKey) return null;

  return pubkeyToAddress(Buffer.from(publicKey.value, "base64"), prefix);
}

export function useEvmAddress() {
  const publicKey = usePublicKey();

  if (!publicKey) return null;

  const publicKeyHex = `0x${Buffer.from(
    secp256k1.publicKeyConvert(Buffer.from(publicKey.value, "base64"), false),
  ).toString("hex")}`;
  return ethers.computeAddress(publicKeyHex);
}
