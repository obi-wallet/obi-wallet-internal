export enum TargetChain {
  EthereumMainnet = "1",
  EthereumGoerli = "5",
  ArbitrumOneGoerliTestnet = "421613",
  ArbitrumOneMainnet = "42161",
  PolygonMainnet = "137",
  PolygonMumbaiTestnet = "80001",
  BaseMainnet = "8453",
  BaseGoerliTestnet = "84531",
  AvalanceCChainMainnet = "43114",
  AvalancheFujiTestnet = "43113",
  OptimismMainnet = "10",
  OptimismGoerliTestnet = "420",
}

export const targetChains = {
  [TargetChain.EthereumMainnet]: {
    chainId: TargetChain.EthereumMainnet,
    name: "Ethereum mainnet",
    symbol: "ETH",
  },
  [TargetChain.EthereumGoerli]: {
    chainId: TargetChain.EthereumGoerli,
    name: "Ethereum Goerli testnet",
    symbol: "GoerliETH",
  },
  [TargetChain.ArbitrumOneGoerliTestnet]: {
    chainId: TargetChain.ArbitrumOneGoerliTestnet,
    name: "Arbitrum One Goerli testnet",
    symbol: "AGOR",
  },
  [TargetChain.ArbitrumOneMainnet]: {
    chainId: TargetChain.ArbitrumOneMainnet,
    name: "Arbitrum One mainnet",
    symbol: "ARB",
  },
  [TargetChain.PolygonMainnet]: {
    chainId: TargetChain.PolygonMainnet,
    name: "Polygon mainnet",
    symbol: "MATIC",
  },
  [TargetChain.PolygonMumbaiTestnet]: {
    chainId: TargetChain.PolygonMumbaiTestnet,
    name: "Polygon Mumbai testnet",
    symbol: "MATIC",
  },
  [TargetChain.BaseMainnet]: {
    chainId: TargetChain.BaseMainnet,
    name: "Base mainnet",
    symbol: "ETH",
  },
  [TargetChain.BaseGoerliTestnet]: {
    chainId: TargetChain.BaseGoerliTestnet,
    name: "Base Goerli testnet",
    symbol: "ETH",
  },
  [TargetChain.AvalanceCChainMainnet]: {
    chainId: TargetChain.AvalanceCChainMainnet,
    name: "Avalanche C-Chain mainnet",
    symbol: "AVAX",
  },
  [TargetChain.AvalancheFujiTestnet]: {
    chainId: TargetChain.AvalancheFujiTestnet,
    name: "Avalanche Fuji testnet",
    symbol: "AVAX",
  },
  [TargetChain.OptimismMainnet]: {
    chainId: TargetChain.OptimismMainnet,
    name: "Optimism mainnet",
    symbol: "ETH",
  },
  [TargetChain.OptimismGoerliTestnet]: {
    chainId: TargetChain.OptimismGoerliTestnet,
    name: "Optimism Goerli testnet",
    symbol: "ETH",
  },
};

export type TargetChainId = keyof typeof targetChains;
