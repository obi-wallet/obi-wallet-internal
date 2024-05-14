import { ChainId } from "../../chains";
import { MultisigKey } from "../../data-structures";
import { Message } from "../../transactions";

/**
 * Creates messages used by the rest of the SDK. We expect you to only need this
 * for generating message fixtures for testing.
 */
export abstract class AbstractMessages {
  protected constructor(protected chainId: ChainId) {}

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
