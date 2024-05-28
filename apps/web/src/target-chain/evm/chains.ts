import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  Chain,
  mainnet,
  sepolia,
} from "viem/chains";
import { z } from "zod";

export enum EvmChainId {
  Arbitrum = "arbitrum",
  ArbitrumTestnet = "arbitrum-testnet",
  Base = "base",
  BaseTestnet = "base-testnet",
  Ethereum = "ethereum-mainnet",
  EthereumTestnet = "ethereum-testnet",
}

export const EvmChainIdSchema: z.ZodType<EvmChainId> = z.union([
  z.literal(EvmChainId.Arbitrum),
  z.literal(EvmChainId.ArbitrumTestnet),
  z.literal(EvmChainId.Base),
  z.literal(EvmChainId.BaseTestnet),
  z.literal(EvmChainId.Ethereum),
  z.literal(EvmChainId.EthereumTestnet),
]);

export function isEvmChainId(chainId: string): chainId is EvmChainId {
  return Object.values<string>(EvmChainId).includes(chainId);
}

export const allEvmChainIds = [
  EvmChainId.Arbitrum,
  EvmChainId.ArbitrumTestnet,
  EvmChainId.Base,
  EvmChainId.BaseTestnet,
  EvmChainId.Ethereum,
  EvmChainId.EthereumTestnet,
];

export interface EvmChainData {
  id: EvmChainId;
  chain: Chain;
  image: string;
  disabled?: boolean;
}

export const EvmChains: Record<EvmChainId, EvmChainData> = {
  [EvmChainId.Arbitrum]: {
    id: EvmChainId.Arbitrum,
    image: "/assets/images/arbitrum-logo.png",
    chain: arbitrum,
    disabled: process.env.NEXT_PUBLIC_ENV === "production",
  },
  [EvmChainId.ArbitrumTestnet]: {
    id: EvmChainId.ArbitrumTestnet,
    image: "/assets/images/arbitrum-logo.png",
    chain: arbitrumSepolia,
    disabled: process.env.NEXT_PUBLIC_ENV === "production",
  },
  [EvmChainId.Base]: {
    id: EvmChainId.Base,
    image: "/assets/images/base-logo.png",
    chain: base,
    disabled: process.env.NEXT_PUBLIC_ENV === "production",
  },
  [EvmChainId.BaseTestnet]: {
    id: EvmChainId.BaseTestnet,
    image: "/assets/images/base-logo.png",
    chain: baseSepolia,
    disabled: process.env.NEXT_PUBLIC_ENV === "production",
  },
  [EvmChainId.Ethereum]: {
    id: EvmChainId.Ethereum,
    image:
      "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
    chain: mainnet,
    disabled: process.env.NEXT_PUBLIC_ENV === "production",
  },
  [EvmChainId.EthereumTestnet]: {
    id: EvmChainId.EthereumTestnet,
    image:
      "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
    chain: sepolia,
    disabled: process.env.NEXT_PUBLIC_ENV === "production",
  },
};
