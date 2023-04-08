import { Chain } from "../../chains";
import {
  GatekeeperConfig,
  MultisigKey,
  MultisigWallet,
} from "../../data-structures";
import { Message } from "../../transactions";
import { CodeIds, Coin } from "../common";

export abstract class AbstractMessages {
  protected constructor(protected chainId: Chain) {}

  public abstract getUpdateWalletMessage({
    wallet,
    codeIds,
  }: {
    wallet: MultisigWallet;
    codeIds: CodeIds;
  }): Message;

  public abstract getProposeUpdateOwnerMessage({
    wallet,
    newOwner,
    codeIds,
  }: {
    wallet: MultisigWallet;
    newOwner: MultisigKey;
    codeIds: CodeIds;
  }): Message;

  public abstract getConfirmUpdateOwnerMessage({
    wallet,
    newOwner,
  }: {
    wallet: MultisigWallet;
    newOwner: MultisigKey;
  }): Message;

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

  public abstract getStakeMessage({
    wallet,
    amount,
    validator,
  }: {
    wallet: MultisigWallet;
    amount: Coin;
    validator: string;
  }): Message;

  public abstract getUnstakeMessage({
    wallet,
    amount,
    validator,
  }: {
    wallet: MultisigWallet;
    amount: Coin;
    validator: string;
  }): Message;

  public abstract getWithdrawRewardsMessage({
    wallet,
    validator,
  }: {
    wallet: MultisigWallet;
    validator: string;
  }): Message;

  public abstract getCreateWalletMessage(multisigKey: MultisigKey): Message;
}
