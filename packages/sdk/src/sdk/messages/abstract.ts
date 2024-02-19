import { ChainId } from "../../chains";
import {
  GatekeeperConfig,
  MultisigKey,
  MultisigWallet,
} from "../../data-structures";
import { Message, MessageJson } from "../../transactions";
import { CodeIds, Token } from "../common";

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

  public abstract getSendMessages({
    fromAddress,
    toAddress,
    tokens,
  }: {
    fromAddress: string;
    toAddress: string;
    tokens: Token[];
  }): Message[];

  /**
   * Message to update a wallet to the current code IDs supported by the app.
   */
  public abstract getUpdateWalletMessage({
    wallet,
    codeIds,
  }: {
    wallet: MultisigWallet;
    codeIds: CodeIds;
  }): Message;

  /**
   * Message to propose a new owner for a wallet. Is usually followed by {@link getConfirmUpdateOwnerMessage}.
   */
  public abstract getProposeUpdateOwnerMessage({
    wallet,
    newOwner,
    userAccountAddress,
    userAccountCodeHash,
  }: {
    wallet: MultisigWallet;
    newOwner: MultisigKey;
    userAccountAddress: string;
    userAccountCodeHash: string;
  }): Message;

  /**
   * Message to confirm a new owner for a wallet. Is usually preceded by {@link getProposeUpdateOwnerMessage}.
   */
  public abstract getConfirmUpdateOwnerMessage({
    wallet,
    newOwner,
    userAccountAddress,
    userAccountCodeHash,
  }: {
    wallet: MultisigWallet;
    newOwner: MultisigKey;
    userAccountAddress: string;
    userAccountCodeHash: string;
  }): Message;

  /**
   * Messages to commit a {@link GatekeeperConfig} to chain.
   */
  public abstract getUpdateGatekeeperMessages({
    wallet,
    newGatekeeperConfig,
    spendLimitGatekeeper,
  }: {
    wallet: MultisigWallet;
    newGatekeeperConfig: GatekeeperConfig;
    spendLimitGatekeeper: string;
  }): Message[];

  /**
   * Message to stake the given amount to the given validator.
   */
  public abstract getStakeMessage({
    wallet,
    amount,
    validator,
  }: {
    wallet: MultisigWallet;
    amount: Token;
    validator: string;
  }): Message;

  /**
   * Message to unstake the given amount from the given validator.
   */
  public abstract getUnstakeMessage({
    wallet,
    amount,
    validator,
  }: {
    wallet: MultisigWallet;
    amount: Token;
    validator: string;
  }): Message;

  /**
   * Message to withdraw rewards from the given validator.
   */
  public abstract getWithdrawRewardsMessage({
    wallet,
    validator,
  }: {
    wallet: MultisigWallet;
    validator: string;
  }): Message;

  /**
   * Message to create a new wallet with the given owner.
   */
  public abstract getCreateWalletMessage(...walletData: T[]): Message;
  public abstract getCreateWalletMessage(key: T): Message;

  /**
   * Message to update a new wallet's owner for the first time.
   */
  public abstract getFirstUpdateWalletMessage(
    newOwner: MultisigKey,
    newOwnerAddress: string,
    userEntryContractAddress: string,
    userEntryCodeHash: string,
    evmUserContractAddress: string,
    evmSigningAddress: string,
    sender: string,
  ): Message;
}
