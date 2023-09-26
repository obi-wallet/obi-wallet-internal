import { SecretJsChainId, SecretJsChainIds, SecretJsChains } from "./secret-js";

export * from "./cosmos";
export * from "./legacy-cosmos";
export * from "./secret-js";
export * from "./terra";

export type ChainId =
  /* | CosmosChainId
  | LegacyCosmosChainId */
  SecretJsChainId;
/* | TerraChainId; */

export const Chain = {
  select,
  information(_chainId: ChainId) {
    return select<
      // | (typeof cosmosChains)[CosmosChainId]
      // | (typeof legacyCosmosChains)[LegacyCosmosChainId]
      (typeof SecretJsChains)[SecretJsChainId]
      // | (typeof terraChains)[TerraChainId]
    >({
      /*onCosmosChain(chain) {
        return chain;
      },
      onLegacyCosmosChain(chain) {
        return chain;
      },*/
      onSecretJsChain(chain) {
        return chain;
      },
      /*onTerraChain(chain) {
        return chain;
      },*/
    });
  },
};

function select<T>({
  /*onCosmosChain,
  onLegacyCosmosChain,*/
  onSecretJsChain /*onTerraChain,*/,
}: {
  /*onCosmosChain(chain: (typeof cosmosChains)[CosmosChainId]): T;
  onLegacyCosmosChain(
    chain: (typeof legacyCosmosChains)[LegacyCosmosChainId],
  ): T;*/
  onSecretJsChain(chain: (typeof SecretJsChains)[SecretJsChainId]): T;
  /*onTerraChain(chain: (typeof terraChains)[TerraChainId]): T;*/
}) {
  return onSecretJsChain(SecretJsChains[SecretJsChainIds.MAINNET]);
  /* if (isCosmosChain(chainId)) {
    return onCosmosChain(cosmosChains[chainId]);
  } else if (isLegacyCosmosChain(chainId)) {
    return onLegacyCosmosChain(legacyCosmosChains[chainId]);
  } else if (isSecretJsChain(chainId)) {
    return onSecretJsChain(secretJsChains[chainId]);
  } else if (isTerraChain(chainId)) {
    return onTerraChain(terraChains[chainId]);
  } else {
    return onSecretJsChain(secretJsChains["secret-4"]);
  }*/
}

/* export function isCosmosChain(chainId: ChainId): chainId is CosmosChainId {
  return Object.keys(cosmosChains).includes(chainId);
}

export function isLegacyCosmosChain(
  chainId: ChainId,
): chainId is LegacyCosmosChainId {
  return Object.keys(legacyCosmosChains).includes(chainId);
} */

export function isSecretJsChain(chainId: ChainId): chainId is SecretJsChainId {
  return Object.keys(SecretJsChains).includes(chainId);
}

/* export function isTerraChain(chainId: ChainId): chainId is TerraChainId {
  return Object.keys(terraChains).includes(chainId);
} */
