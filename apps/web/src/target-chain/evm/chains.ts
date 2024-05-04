import { arbitrum, Chain } from "viem/chains";

export enum EvmChainId {
  Arbitrum = "arbitrum",
}

export function isEvmChainId(chainId: string): chainId is EvmChainId {
  return Object.values<string>(EvmChainId).includes(chainId);
}

export const allEvmChainIds = [EvmChainId.Arbitrum];

export interface EvmChainData {
  id: EvmChainId;
  chain: Chain;
  image: string;
  disabled?: boolean;
}

export const EvmChains: Record<EvmChainId, EvmChainData> = {
  [EvmChainId.Arbitrum]: {
    id: EvmChainId.Arbitrum,
    image: "/assets/images/logo-arbitrum.png",
    chain: arbitrum,
  },
};
