import { SecretJsMessages } from "./secret-js";
import { HomeChainId } from "../../home-chains";

export class Messages {
  protected static instances: Partial<Record<HomeChainId, SecretJsMessages>> =
    {};

  public static chainId(chainId: HomeChainId) {
    const cache = this.instances[chainId];
    if (cache) return cache;

    const messages = SecretJsMessages.chainId(chainId);
    this.instances[chainId] = messages;
    return messages;
  }
}
