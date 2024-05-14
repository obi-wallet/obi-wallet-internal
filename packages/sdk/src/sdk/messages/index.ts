import { SecretJsMessages } from "./secret-js";
import { ChainId } from "../../chains";

export class Messages {
  protected static instances: Partial<Record<ChainId, SecretJsMessages>> = {};

  public static chainId(chainId: ChainId) {
    const cache = this.instances[chainId];
    if (cache) return cache;

    const messages = SecretJsMessages.chainId(chainId);
    this.instances[chainId] = messages;
    return messages;
  }
}
