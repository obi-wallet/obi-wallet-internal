export enum TargetChain {
  ETHEREUM_MAINNET = "1",
  ETHEREUM_GOERLI_TESTNET = "5",
  ARBITRUM_ONE_GOERLI_TESTNET = "421613",
  ARBITRUM_ONE_MAINNET = "42161",
  POLYGON_MAINNET = "137",
  POLYGON_MUMBAI_TESTNET = "80001",
  BASE_MAINNET = "8453",
  BASE_GOERLI_TESTNET = "84531",
  AVALANCHE_C_CHAIN_MAINNET = "43114",
  AVALANCHE_FUJI_TESTNET = "43113",
  OPTIMISM_MAINNET = "10",
  OPTIMISM_GOERLI_TESTNET = "420",
}

export const targetChains = {
  [TargetChain.ETHEREUM_MAINNET]: {
    chainId: TargetChain.ETHEREUM_MAINNET,
    name: "Ethereum mainnet",
    symbol: "ETH",
  },
  [TargetChain.ETHEREUM_GOERLI_TESTNET]: {
    chainId: TargetChain.ETHEREUM_GOERLI_TESTNET,
    name: "Ethereum Goerli testnet",
    symbol: "GoerliETH",
  },
  [TargetChain.ARBITRUM_ONE_GOERLI_TESTNET]: {
    chainId: TargetChain.ARBITRUM_ONE_GOERLI_TESTNET,
    name: "Arbitrum One Goerli testnet",
    symbol: "AGOR",
  },
  [TargetChain.ARBITRUM_ONE_MAINNET]: {
    chainId: TargetChain.ARBITRUM_ONE_MAINNET,
    name: "Arbitrum One mainnet",
    symbol: "ARB",
  },
  [TargetChain.POLYGON_MAINNET]: {
    chainId: TargetChain.POLYGON_MAINNET,
    name: "Polygon mainnet",
    symbol: "MATIC",
  },
  [TargetChain.POLYGON_MUMBAI_TESTNET]: {
    chainId: TargetChain.POLYGON_MUMBAI_TESTNET,
    name: "Polygon Mumbai testnet",
    symbol: "MATIC",
  },
  [TargetChain.BASE_MAINNET]: {
    chainId: TargetChain.BASE_MAINNET,
    name: "Base mainnet",
    symbol: "ETH",
  },
  [TargetChain.BASE_GOERLI_TESTNET]: {
    chainId: TargetChain.BASE_GOERLI_TESTNET,
    name: "Base Goerli testnet",
    symbol: "ETH",
  },
  [TargetChain.AVALANCHE_C_CHAIN_MAINNET]: {
    chainId: TargetChain.AVALANCHE_C_CHAIN_MAINNET,
    name: "Avalanche C-Chain mainnet",
    symbol: "AVAX",
  },
  [TargetChain.AVALANCHE_FUJI_TESTNET]: {
    chainId: TargetChain.AVALANCHE_FUJI_TESTNET,
    name: "Avalanche Fuji testnet",
    symbol: "AVAX",
  },
  [TargetChain.OPTIMISM_MAINNET]: {
    chainId: TargetChain.OPTIMISM_MAINNET,
    name: "Optimism mainnet",
    symbol: "ETH",
  },
  [TargetChain.OPTIMISM_GOERLI_TESTNET]: {
    chainId: TargetChain.OPTIMISM_GOERLI_TESTNET,
    name: "Optimism Goerli testnet",
    symbol: "ETH",
  },
};

export type TargetChainId = keyof typeof TargetChain;
