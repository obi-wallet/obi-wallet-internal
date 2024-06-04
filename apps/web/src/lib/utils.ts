import { CosmosChainId } from "@/target-chain/cosmos/chains";
import clsx, { ClassValue } from "clsx";
import { ec } from "elliptic";
import { twMerge } from "tailwind-merge";

/** Merge classes with tailwind-merge with clsx full feature */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function decompressPoint(compressedPointHex: string): string {
  // Decode the compressed point to get an elliptic curve point
  const secp256k1 = new ec("secp256k1");
  const point = secp256k1.curve.decodePoint(compressedPointHex, "hex");

  // Retrieve the uncompressed x and y coordinates
  const x = point.getX().toString(16).padStart(64, "0");
  const y = point.getY().toString(16).padStart(64, "0");

  // Create the uncompressed hex string
  return x + y;
}

export function getFromChain(chainId: string) {
  return fromChains.find((c) => {
    return c.chainId === chainId;
  });
}

export const fromChains = [
  {
    chainId: "42161",
    label: "Arbitrum",
    image: "/assets/images/arbitrum-logo.png",
  },
  {
    chainId: "8453",
    label: "Base",
    image: "/assets/images/base-logo.png",
  },
  {
    chainId: "1",
    label: "Ethereum",
    image:
      "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
    disabled: true,
  },
];

export const toChains = [
  CosmosChainId.Sei,
  CosmosChainId.Inj,
  CosmosChainId.Osmosis,
  CosmosChainId.Neutron,
  CosmosChainId.Stargaze,
];
