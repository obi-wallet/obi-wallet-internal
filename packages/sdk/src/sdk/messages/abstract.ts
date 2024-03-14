import { ChainId } from "../../chains";
import { MultisigKey } from "../../data-structures";
import { Message, MessageJson } from "../../transactions";

/**
 * Creates messages used by the rest of the SDK. We expect you to only need this
 * for generating message fixtures for testing.
 */
export abstract class AbstractMessages<T> {
  protected constructor(protected chainId: ChainId) {}

  public abstract toJSON(message: Message): MessageJson;

  public abstract wrapMessages({
    messages,
    sender,
    userEntryContract,
    userEntryCodeHash,
  }: {
    messages: Message[];
    sender: string;
    userEntryContract: string;
    userEntryCodeHash?: string;
  }): Message[];

  /**
   * Message to create a new wallet with the given owner.
   */
  public abstract getCreateWalletMessage(...walletData: T[]): Message;

  /**
   * Message to update a new wallet's owner for the first time.
   */
  public abstract getFirstUpdateWalletMessage(
    newOwner: MultisigKey,
    newOwnerAddress: string,
    userEntryContractAddress: string,
    userEntryCodeHash: string,
    sender: string,
  ): Message;
}
