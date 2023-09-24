import { AbstractSdk } from "./abstract";
import { SecretJsSdk } from "./secret-js";
import { Chain, ChainId } from "../../chains";

export class Sdk {
  protected static instances: Partial<Record<ChainId, AbstractSdk>> = {};

  public static chainId(chainId: ChainId) {
    const cache = this.instances[chainId];
    if (cache) return cache;

    const sdk = Chain.select<AbstractSdk>({
      chainId,
      /*onCosmosChain({ chainId }) {
        return CosmosSdk.chainId(chainId);
      },
      onLegacyCosmosChain({ chainId }) {
        return LegacyCosmosSdk.chainId(chainId);
      },*/
      onSecretJsChain({ chainId }) {
        return SecretJsSdk.chainId(chainId);
      },
      /*onTerraChain({ chainId }) {
        return TerraSdk.chainId(chainId);
      },*/
    });
    this.instances[chainId] = sdk;
    return sdk;
  }
}
