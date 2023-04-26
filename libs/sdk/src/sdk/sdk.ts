import { AbstractSdk } from "./abstract";
import { CosmosSdk } from "./cosmos";
import { TerraSdk } from "./terra";
import { Chain, ChainId, TerraChain } from "../chains";

export class Sdk {
  protected static instances: Partial<Record<ChainId, AbstractSdk>> = {};

  public static chainId(chainId: ChainId) {
    const cache = this.instances[chainId];
    if (cache) return cache;

    const sdk = Chain.select<AbstractSdk>({
      chainId,
      onCosmosChain(chainId) {
        return CosmosSdk.chainId(chainId);
      },
      onTerraChain(chainId: TerraChain) {
        return TerraSdk.chainId(chainId);
      },
    });
    this.instances[chainId] = sdk;
    return sdk;
  }
}
