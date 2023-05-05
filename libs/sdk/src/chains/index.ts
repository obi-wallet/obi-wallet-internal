import { LegacyCosmosChain, legacyCosmosChains } from "./legacy-cosmos";
import { TerraChain, terraChains } from "./terra";

export * from "./legacy-cosmos";
export * from "./terra";

export type ChainId = LegacyCosmosChain | TerraChain;

export const Chain = {
  select<T>({
    chainId,
    onLegacyCosmosChain,
    onTerraChain,
  }: {
    chainId: ChainId;
    onLegacyCosmosChain(chainId: LegacyCosmosChain): T;
    onTerraChain(chainId: TerraChain): T;
  }) {
    if (isLegacyCosmosChain(chainId)) {
      return onLegacyCosmosChain(chainId);
    } else if (isTerraChain(chainId)) {
      return onTerraChain(chainId);
    } else {
      throw new Error(`Unknown chain ID: ${chainId}`);
    }
  },
};

export function isLegacyCosmosChain(
  chainId: ChainId
): chainId is LegacyCosmosChain {
  return Object.keys(legacyCosmosChains).includes(chainId);
}

export function isTerraChain(chainId: ChainId): chainId is TerraChain {
  return Object.keys(terraChains).includes(chainId);
}
