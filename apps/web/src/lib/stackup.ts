import { TargetChainId } from "@obi-wallet/sdk";
import {
  getSec256k1UncompressedPublicKey,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk-secp256k1";
import { getAddress, keccak256 } from "viem";

function publicKeyToAddress(publicKey: Secp256k1PublicKey) {
  const u8 = getSec256k1UncompressedPublicKey(publicKey);
  const hex = `0x${Buffer.from(u8).toString("hex")}`;
  const address = keccak256(`0x${hex.substring(4)}`).substring(26);
  return getAddress(`0x${address}`);
}

export function computeEthereumAddress(publicKey: Secp256k1PublicKey) {
  return publicKeyToAddress(publicKey);
}

export function getConfig(chainId: TargetChainId) {
  const apiKeys = JSON.parse(process.env.STACKUP_API_KEYS ?? "{}");
  const apiKey = apiKeys[chainId];

  if (!apiKey) return null;

  return {
    rpcUrl: `https://api.stackup.sh/v1/node/${apiKey}`,
    paymaster: {
      rpcUrl: `https://api.stackup.sh/v1/paymaster/${apiKey}`,
      context: { type: "payg" },
    },
  };
}
