import { AbstractMessages } from "./abstract";
import { CosmosMessages } from "./cosmos/messages";
import { TerraMessages } from "./terra/messages";
import { Chain, ChainId } from "../chains";

export class Messages {
  protected static instances: Partial<Record<ChainId, AbstractMessages>> = {};

  public static chainId(chainId: ChainId) {
    const cache = this.instances[chainId];
    if (cache) return cache;

    const messages = Chain.select<AbstractMessages>({
      chainId,
      onCosmosChain(_) {
        // TODO:
        throw new Error("Messages not implemented for Cosmos");
      },
      onLegacyCosmosChain({ chainId }) {
        return CosmosMessages.chainId(chainId);
      },
      onTerraChain({ chainId }) {
        return TerraMessages.chainId(chainId);
      },
    });
    this.instances[chainId] = messages;
    return messages;
  }
}
