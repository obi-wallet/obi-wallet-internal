import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  bsc,
  bscTestnet,
  Chain,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from "viem/chains";
import { z } from "zod";

export enum EvmChainId {
  Arbitrum = "arbitrum",
  ArbitrumTestnet = "arbitrum-testnet",
  Base = "base",
  BaseTestnet = "base-testnet",
  Bsc = "bsc",
  BscTestnet = "bsc-testnet",
  Ethereum = "ethereum",
  EthereumTestnet = "ethereum-testnet",
  Optimism = "optimism",
  Polygon = "polygon",
}

export const EvmChainIdSchema: z.ZodType<EvmChainId> = z.union([
  z.literal(EvmChainId.Arbitrum),
  z.literal(EvmChainId.ArbitrumTestnet),
  z.literal(EvmChainId.Base),
  z.literal(EvmChainId.BaseTestnet),
  z.literal(EvmChainId.Bsc),
  z.literal(EvmChainId.BscTestnet),
  z.literal(EvmChainId.Ethereum),
  z.literal(EvmChainId.EthereumTestnet),
  z.literal(EvmChainId.Optimism),
  z.literal(EvmChainId.Polygon),
]);

export function isEvmChainId(chainId: string): chainId is EvmChainId {
  return Object.values<string>(EvmChainId).includes(chainId);
}

export const allEvmChainIds = [
  EvmChainId.Arbitrum,
  EvmChainId.ArbitrumTestnet,
  EvmChainId.Base,
  EvmChainId.BaseTestnet,
  EvmChainId.Bsc,
  EvmChainId.BscTestnet,
  EvmChainId.Ethereum,
  EvmChainId.EthereumTestnet,
  EvmChainId.Optimism,
  EvmChainId.Polygon,
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
  [EvmChainId.Bsc]: {
    id: EvmChainId.Bsc,
    image:
      "https://assets.coingecko.com/coins/images/825/standard/bnb-icon2_2x.png?1696501970",
    chain: bsc,
    disabled: process.env.NEXT_PUBLIC_ENV === "production",
  },
  [EvmChainId.BscTestnet]: {
    id: EvmChainId.BscTestnet,
    image:
      "https://assets.coingecko.com/coins/images/825/standard/bnb-icon2_2x.png?1696501970",
    chain: bscTestnet,
    disabled: process.env.NEXT_PUBLIC_ENV === "production",
  },
  [EvmChainId.Optimism]: {
    id: EvmChainId.Optimism,
    image:
      "https://assets.coingecko.com/coins/images/25244/standard/Optimism.png?1696524385",
    chain: optimism,
    disabled: process.env.NEXT_PUBLIC_ENV === "production",
  },
  [EvmChainId.Polygon]: {
    id: EvmChainId.Polygon,
    image:
      "https://assets.coingecko.com/coins/images/4713/standard/polygon.png?1698233745",
    chain: polygon,
    disabled: process.env.NEXT_PUBLIC_ENV === "production",
  },
};
