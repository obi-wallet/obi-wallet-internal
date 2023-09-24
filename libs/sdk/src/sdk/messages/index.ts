import { AbstractMessages } from "./abstract";
import { SecretJsMessages } from "./secret-js";
import { Chain, ChainId } from "../../chains";
import { MultisigKey } from "../../data-structures";

export class Messages {
  protected static instances: Partial<
    Record<ChainId, AbstractMessages<string | MultisigKey>>
  > = {};

  public static chainId(chainId: ChainId) {
    const cache = this.instances[chainId];
    if (cache) return cache;

    const messages = Chain.select<AbstractMessages<string | MultisigKey>>({
      chainId,
      /*onCosmosChain({ chainId }) {
        return CosmosSdkMessages.chainId(chainId);
      },
      onLegacyCosmosChain({ chainId }) {
        return LegacyCosmosMessages.chainId(chainId);
      },*/
      onSecretJsChain({ chainId }) {
        return SecretJsMessages.chainId(chainId);
      },
      /*onTerraChain({ chainId }) {
        return CosmosSdkMessages.chainId(chainId);
      },*/
    });
    this.instances[chainId] = messages;
    return messages;
  }
}
