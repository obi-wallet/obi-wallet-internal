export enum SolanaChainId {
  Mainnet = "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
  Devnet = "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
}

export const allSolanaChains = [SolanaChainId.Mainnet, SolanaChainId.Devnet];

export function isSolanaChainId(chainId: string): chainId is SolanaChainId {
  return Object.values<string>(SolanaChainId).includes(chainId);
}

export interface SolanaChainData {
  id: SolanaChainId;
  name: string;
  endpoint: string;
  disabled?: boolean;
}

export const SolanaChains: Record<SolanaChainId, SolanaChainData> = {
  [SolanaChainId.Mainnet]: {
    id: SolanaChainId.Mainnet,
    name: "Solana Mainnet",
    // TODO:
    endpoint: "https://solana-rpc.publicnode.com",
  },
  [SolanaChainId.Devnet]: {
    id: SolanaChainId.Devnet,
    name: "Solana Devnet",
    endpoint: "https://api.devnet.solana.com",
    disabled: true,
  },
};
