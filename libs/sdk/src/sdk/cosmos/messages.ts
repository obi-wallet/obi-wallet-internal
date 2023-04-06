import warning from "tiny-warning";

import { CosmosChain } from "../../chains";
import {
  GatekeeperConfig,
  MultisigKey,
  MultisigWallet,
} from "../../data-structures";
import { Message } from "../../transactions";
import { AbstractMessages } from "../abstract";
import { CodeIds, Coin } from "../common";

function notImplemented(message: string) {
  warning(false, message);
}

export class CosmosMessages extends AbstractMessages {
  protected constructor(protected chainId: CosmosChain) {
    super(chainId);
  }

  public getUpdateWalletMessage(_: {
    wallet: MultisigWallet;
    codeIds: CodeIds;
  }): Message {
    notImplemented("getUpdateWalletMessage not implemented for Cosmos");
    throw new Error("getUpdateWalletMessage not implemented for Cosmos");
  }

  public getProposeUpdateOwnerMessage(_: {
    wallet: MultisigWallet;
    newOwner: MultisigKey;
    codeIds: CodeIds;
  }): Message {
    notImplemented("getProposeUpdateOwnerMessage not implemented for Cosmos");
    throw new Error("getProposeUpdateOwnerMessage not implemented for Cosmos");
  }

  public getConfirmUpdateOwnerMessage(_: {
    wallet: MultisigWallet;
    newOwner: MultisigKey;
  }): Message {
    notImplemented("getConfirmUpdateOwnerMessage not implemented for Cosmos");
    throw new Error("getConfirmUpdateOwnerMessage not implemented for Cosmos");
  }

  public getUpdateGatekeeperMessages(_: {
    wallet: MultisigWallet;
    newGatekeeperConfig: GatekeeperConfig;
    spendLimitGatekeeper: string;
    sessionKeyGatekeeper: string;
  }): Message[] {
    notImplemented("getUpdateGatekeeperMessages not implemented for Cosmos");
    return [];
  }

  public getStakeMessage(_: {
    wallet: MultisigWallet;
    amount: Coin;
    validator: string;
  }): Message {
    notImplemented("getStakeMessage not implemented for Cosmos");
    throw new Error("getStakeMessage not implemented for Cosmos");
  }

  public getUnstakeMessage(_: {
    wallet: MultisigWallet;
    amount: Coin;
    validator: string;
  }): Message {
    notImplemented("getUnstakeMessage not implemented for Cosmos");
    throw new Error("getUnstakeMessage not implemented for Cosmos");
  }

  public getWithdrawRewardsMessage(_: {
    wallet: MultisigWallet;
    validator: string;
  }): Message {
    notImplemented("getWithdrawRewardsMessage not implemented for Cosmos");
    throw new Error("getWithdrawRewardsMessage not implemented for Cosmos");
  }

  public getCreateWalletMessage(_: MultisigKey): Message {
    notImplemented("getCreateWalletMessage not implemented for Cosmos");
    throw new Error("getCreateWalletMessage not implemented for Cosmos");
  }

  public static chainId(chainId: CosmosChain) {
    return new CosmosMessages(chainId);
  }
}
