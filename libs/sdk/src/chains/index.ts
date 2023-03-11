import { CosmosChain, cosmosChains } from "./cosmos";
import { TerraChain, terraChains } from "./terra";

export * from "./cosmos";
export * from "./terra";

export type Chain = CosmosChain | TerraChain;

export const Chain = {
  select<T>({
    chainId,
    onCosmosChain,
    onTerraChain,
  }: {
    chainId: Chain;
    onCosmosChain(chainId: CosmosChain): T;
    onTerraChain(chainId: TerraChain): T;
  }) {
    if (isCosmosChain(chainId)) {
      return onCosmosChain(chainId);
    } else if (isTerraChain(chainId)) {
      return onTerraChain(chainId);
    } else {
      throw new Error(`Unknown chain ID: ${chainId}`);
    }
  },
};

export function isCosmosChain(
  chain: CosmosChain | TerraChain
): chain is CosmosChain {
  return Object.keys(cosmosChains).includes(chain);
}

export function isTerraChain(
  chain: CosmosChain | TerraChain
): chain is TerraChain {
  return Object.keys(terraChains).includes(chain);
}
