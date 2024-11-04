import { AbstractSdk } from "./abstract";
import { SecretJsSdk } from "./secret-js";
import { HomeChainId } from "../../home-chains";

export class Sdk {
  protected static instances: Partial<Record<HomeChainId, AbstractSdk>> = {};

  public static chainId(chainId: HomeChainId) {
    const cache = this.instances[chainId];
    if (cache) return cache;

    const sdk = SecretJsSdk.chainId(chainId);

    this.instances[chainId] = sdk;
    return sdk;
  }
}
