export enum BitcoinChainId {
  Mainnet = "bitcoin-mainnet",
  Testnet = "bitcoin-testnet",
}

export function isBitcoinChainId(chainId: string): chainId is BitcoinChainId {
  return (
    chainId === BitcoinChainId.Mainnet || chainId === BitcoinChainId.Testnet
  );
}
