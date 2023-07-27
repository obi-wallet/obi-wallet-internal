import { CosmosChainId, cosmosChains } from "./cosmos";
import { LegacyCosmosChainId, legacyCosmosChains } from "./legacy-cosmos";
import { SecretJsChainId, secretJsChains } from "./secret-js";
import { TerraChainId, terraChains } from "./terra";

export * from "./cosmos";
export * from "./legacy-cosmos";
export * from "./secret-js";
export * from "./terra";

export type ChainId =
  | CosmosChainId
  | LegacyCosmosChainId
  | SecretJsChainId
  | TerraChainId;

export const Chain = {
  select,
  information(chainId: ChainId) {
    return select<
      | (typeof cosmosChains)[CosmosChainId]
      | (typeof legacyCosmosChains)[LegacyCosmosChainId]
      | (typeof secretJsChains)[SecretJsChainId]
      | (typeof terraChains)[TerraChainId]
    >({
      chainId: chainId,
      onCosmosChain(chain) {
        return chain;
      },
      onLegacyCosmosChain(chain) {
        return chain;
      },
      onSecretJsChain(chain) {
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
  onSecretJsChain,
  onTerraChain,
}: {
  chainId: ChainId;
  onCosmosChain(chain: (typeof cosmosChains)[CosmosChainId]): T;
  onLegacyCosmosChain(
    chain: (typeof legacyCosmosChains)[LegacyCosmosChainId],
  ): T;
  onSecretJsChain(chain: (typeof secretJsChains)[SecretJsChainId]): T;
  onTerraChain(chain: (typeof terraChains)[TerraChainId]): T;
}) {
  if (isCosmosChain(chainId)) {
    return onCosmosChain(cosmosChains[chainId]);
  } else if (isLegacyCosmosChain(chainId)) {
    return onLegacyCosmosChain(legacyCosmosChains[chainId]);
  } else if (isSecretJsChain(chainId)) {
    return onSecretJsChain(secretJsChains[chainId]);
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

export function isSecretJsChain(chainId: ChainId): chainId is SecretJsChainId {
  return Object.keys(secretJsChains).includes(chainId);
}

export function isTerraChain(chainId: ChainId): chainId is TerraChainId {
  return Object.keys(terraChains).includes(chainId);
}
