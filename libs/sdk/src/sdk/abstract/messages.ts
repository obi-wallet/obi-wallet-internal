import { Chain } from "../../chains";
import {
  GatekeeperConfig,
  MultisigKey,
  MultisigWallet,
} from "../../data-structures";
import { Message } from "../../transactions";
import { CodeIds, Coin } from "../common";

/**
 * Creates messages used by the rest of the SDK. We expect you to only need this
 * for generating message fixtures for testing.
 */
export abstract class AbstractMessages {
  protected constructor(protected chainId: Chain) {}

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
    codeIds,
  }: {
    wallet: MultisigWallet;
    newOwner: MultisigKey;
    codeIds: CodeIds;
  }): Message;

  /**
   * Message to confirm a new owner for a wallet. Is usually preceded by {@link getProposeUpdateOwnerMessage}.
   */
  public abstract getConfirmUpdateOwnerMessage({
    wallet,
    newOwner,
  }: {
    wallet: MultisigWallet;
    newOwner: MultisigKey;
  }): Message;

  /**
   * Messages to commit a {@link GatekeeperConfig} to chain.
   */
  public abstract getUpdateGatekeeperMessages({
    wallet,
    newGatekeeperConfig,
    spendLimitGatekeeper,
    sessionKeyGatekeeper,
  }: {
    wallet: MultisigWallet;
    newGatekeeperConfig: GatekeeperConfig;
    spendLimitGatekeeper: string;
    sessionKeyGatekeeper: string;
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
    amount: Coin;
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
    amount: Coin;
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
  public abstract getCreateWalletMessage(owner: MultisigKey): Message;
}
