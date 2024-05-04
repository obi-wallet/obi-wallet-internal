export enum EvmChainId {
  Arbitrum = "arbitrum",
}

export function isEvmChainId(chainId: string): chainId is EvmChainId {
  return Object.values<string>(EvmChainId).includes(chainId);
}

export const allEvmChainIds = [EvmChainId.Arbitrum];
