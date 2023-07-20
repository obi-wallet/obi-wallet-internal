import { AbstractMessages } from "./abstract";
import { CosmosSdkMessages } from "./cosmos-sdk";
import { LegacyCosmosMessages } from "./legacy-cosmos";
import { Chain, ChainId } from "../../chains";

export class Messages {
  protected static instances: Partial<Record<ChainId, AbstractMessages>> = {};

  public static chainId(chainId: ChainId) {
    const cache = this.instances[chainId];
    if (cache) return cache;

    const messages = Chain.select<AbstractMessages>({
      chainId,
      onCosmosChain({ chainId }) {
        return CosmosSdkMessages.chainId(chainId);
      },
      onLegacyCosmosChain({ chainId }) {
        return LegacyCosmosMessages.chainId(chainId);
      },
      onSecretJsChain() {
        // TODO:
        throw new Error("SecretJS does not support messages");
      },
      onTerraChain({ chainId }) {
        return CosmosSdkMessages.chainId(chainId);
      },
    });
    this.instances[chainId] = messages;
    return messages;
  }
}
