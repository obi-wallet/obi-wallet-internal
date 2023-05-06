import { AbstractSdk } from "./abstract";
import { CosmosSdk } from "./cosmos";
import { LegacyCosmosSdk } from "./legacy-cosmos";
import { TerraSdk } from "./terra";
import { Chain, ChainId } from "../chains";

export class Sdk {
  protected static instances: Partial<Record<ChainId, AbstractSdk>> = {};

  public static chainId(chainId: ChainId) {
    const cache = this.instances[chainId];
    if (cache) return cache;

    const sdk = Chain.select<AbstractSdk>({
      chainId,
      onCosmosChain({ chainId }) {
        return CosmosSdk.chainId(chainId);
      },
      onLegacyCosmosChain({ chainId }) {
        return LegacyCosmosSdk.chainId(chainId);
      },
      onTerraChain({ chainId }) {
        return TerraSdk.chainId(chainId);
      },
    });
    this.instances[chainId] = sdk;
    return sdk;
  }
}
