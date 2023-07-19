import { CosmosChainId, cosmosChains } from "./cosmos";
import { LegacyCosmosChainId, legacyCosmosChains } from "./legacy-cosmos";
import { TerraChainId, terraChains } from "./terra";

export * from "./cosmos";
export * from "./legacy-cosmos";
export * from "./terra";

export type ChainId = CosmosChainId | LegacyCosmosChainId | TerraChainId;

export const Chain = {
  select,
  information(chainId: ChainId) {
    return select<
      | (typeof cosmosChains)[CosmosChainId]
      | (typeof legacyCosmosChains)[LegacyCosmosChainId]
      | (typeof terraChains)[TerraChainId]
    >({
      chainId: chainId,
      onCosmosChain(chain) {
        return chain;
      },
      onLegacyCosmosChain(chain) {
        return chain;
      },
      onTerraChain(chain) {
        return chain;
      },
    });
  },
};

function select<T>({
  chainId,
  onCosmosChain,
  onLegacyCosmosChain,
  onTerraChain,
}: {
  chainId: ChainId;
  onCosmosChain(chain: (typeof cosmosChains)[CosmosChainId]): T;
  onLegacyCosmosChain(
    chain: (typeof legacyCosmosChains)[LegacyCosmosChainId],
  ): T;
  onTerraChain(chain: (typeof terraChains)[TerraChainId]): T;
}) {
  if (isCosmosChain(chainId)) {
    return onCosmosChain(cosmosChains[chainId]);
  } else if (isLegacyCosmosChain(chainId)) {
    return onLegacyCosmosChain(legacyCosmosChains[chainId]);
  } else if (isTerraChain(chainId)) {
    return onTerraChain(terraChains[chainId]);
  } else {
    throw new Error(`Unknown chain ID: ${chainId}`);
  }
}

export function isCosmosChain(chainId: ChainId): chainId is CosmosChainId {
  return Object.keys(cosmosChains).includes(chainId);
}

export function isLegacyCosmosChain(
  chainId: ChainId,
): chainId is LegacyCosmosChainId {
  return Object.keys(legacyCosmosChains).includes(chainId);
}

export function isTerraChain(chainId: ChainId): chainId is TerraChainId {
  return Object.keys(terraChains).includes(chainId);
}
