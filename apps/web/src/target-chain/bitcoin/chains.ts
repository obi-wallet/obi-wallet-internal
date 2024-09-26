export enum BitcoinChainId {
  Mainnet = "bitcoin-mainnet",
  Testnet = "bitcoin-testnet",
}

export function isBitcoinChainId(chainId: string): chainId is BitcoinChainId {
  return Object.values(BitcoinChainId).includes(chainId as BitcoinChainId);
}
