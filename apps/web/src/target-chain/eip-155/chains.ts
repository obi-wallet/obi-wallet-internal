import {
  arbitrum,
  arbitrumSepolia,
  avalanche,
  base,
  baseSepolia,
  bsc,
  bscTestnet,
  Chain,
  cronos,
  mainnet,
  optimism,
  polygon,
  sepolia,
  zora,
} from "viem/chains";
import { z } from "zod";

export enum Eip155ChainId {
  Arbitrum = "eip155:42161",
  ArbitrumTestnet = "eip155:421614",
  Avalanche = "eip155:43114",
  Base = "eip155:8453",
  BaseTestnet = "eip155:84532",
  Bsc = "eip155:56",
  BscTestnet = "eip155:97",
  Cronos = "eip155:25",
  Ethereum = "eip155:1",
  EthereumTestnet = "eip155:11155111",
  Optimism = "eip155:10",
  Polygon = "eip155:137",
  Zora = "eip155:7777777",
}

export const Eip155ChainIdSchema: z.ZodType<Eip155ChainId> = z.union([
  z.literal(Eip155ChainId.Arbitrum),
  z.literal(Eip155ChainId.ArbitrumTestnet),
  z.literal(Eip155ChainId.Avalanche),
  z.literal(Eip155ChainId.Base),
  z.literal(Eip155ChainId.BaseTestnet),
  z.literal(Eip155ChainId.Bsc),
  z.literal(Eip155ChainId.BscTestnet),
  z.literal(Eip155ChainId.Cronos),
  z.literal(Eip155ChainId.Ethereum),
  z.literal(Eip155ChainId.EthereumTestnet),
  z.literal(Eip155ChainId.Optimism),
  z.literal(Eip155ChainId.Polygon),
  z.literal(Eip155ChainId.Zora),
]);

export function isEip155ChainId(chainId: string): chainId is Eip155ChainId {
  return Object.values<string>(Eip155ChainId).includes(chainId);
}

export const allEip155Chains = [
  Eip155ChainId.Arbitrum,
  Eip155ChainId.ArbitrumTestnet,
  Eip155ChainId.Avalanche,
  Eip155ChainId.Base,
  Eip155ChainId.BaseTestnet,
  Eip155ChainId.Bsc,
  Eip155ChainId.BscTestnet,
  Eip155ChainId.Cronos,
  Eip155ChainId.Ethereum,
  Eip155ChainId.EthereumTestnet,
  Eip155ChainId.Optimism,
  Eip155ChainId.Polygon,
  Eip155ChainId.Zora,
];

export interface Eip155ChainData {
  id: Eip155ChainId;
  chain: Chain;
  image: string;
  disabled?: boolean;
}

export const Eip155Chains: Record<Eip155ChainId, Eip155ChainData> = {
  [Eip155ChainId.Arbitrum]: {
    id: Eip155ChainId.Arbitrum,
    image: "/assets/images/arbitrum-logo.png",
    chain: arbitrum,
  },
  [Eip155ChainId.ArbitrumTestnet]: {
    id: Eip155ChainId.ArbitrumTestnet,
    image: "/assets/images/arbitrum-logo.png",
    chain: arbitrumSepolia,
    disabled: process.env.NEXT_PUBLIC_ENV === "production",
  },
  [Eip155ChainId.Avalanche]: {
    id: Eip155ChainId.Avalanche,
    image:
      "https://assets.coingecko.com/coins/images/12559/standard/Avalanche_Circle_RedWhite_Trans.png?1696512369",
    chain: avalanche,
  },
  [Eip155ChainId.Base]: {
    id: Eip155ChainId.Base,
    image: "/assets/images/base-logo.png",
    chain: base,
  },
  [Eip155ChainId.BaseTestnet]: {
    id: Eip155ChainId.BaseTestnet,
    image: "/assets/images/base-logo.png",
    chain: baseSepolia,
    disabled: process.env.NEXT_PUBLIC_ENV === "production",
  },
  [Eip155ChainId.Bsc]: {
    id: Eip155ChainId.Bsc,
    image:
      "https://assets.coingecko.com/coins/images/825/standard/bnb-icon2_2x.png?1696501970",
    chain: bsc,
  },
  [Eip155ChainId.BscTestnet]: {
    id: Eip155ChainId.BscTestnet,
    image:
      "https://assets.coingecko.com/coins/images/825/standard/bnb-icon2_2x.png?1696501970",
    chain: bscTestnet,
    disabled: process.env.NEXT_PUBLIC_ENV === "production",
  },
  [Eip155ChainId.Cronos]: {
    id: Eip155ChainId.Cronos,
    image:
      "https://assets.coingecko.com/coins/images/7310/standard/cro_token_logo.png?1696507599",
    chain: cronos,
    disabled: true,
  },
  [Eip155ChainId.Ethereum]: {
    id: Eip155ChainId.Ethereum,
    image:
      "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
    chain: mainnet,
  },
  [Eip155ChainId.EthereumTestnet]: {
    id: Eip155ChainId.EthereumTestnet,
    image:
      "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
    chain: sepolia,
    disabled: process.env.NEXT_PUBLIC_ENV === "production",
  },
  [Eip155ChainId.Optimism]: {
    id: Eip155ChainId.Optimism,
    image:
      "https://assets.coingecko.com/coins/images/25244/standard/Optimism.png?1696524385",
    chain: optimism,
  },
  [Eip155ChainId.Polygon]: {
    id: Eip155ChainId.Polygon,
    image:
      "https://assets.coingecko.com/coins/images/4713/standard/polygon.png?1698233745",
    chain: polygon,
  },
  [Eip155ChainId.Zora]: {
    id: Eip155ChainId.Zora,
    image:
      "https://assets.coingecko.com/markets/images/1479/large/zora.jpeg?1709872000",
    chain: zora,
    disabled: true,
  },
};
