import warning from "tiny-warning";

import { LegacyCosmosChainId } from "../../../chains";
import {
  GatekeeperConfig,
  MultisigKey,
  MultisigWallet,
} from "../../../data-structures";
import { Message, MessageJson } from "../../../transactions";
import { CodeIds, Token } from "../../common";
import { AbstractMessages } from "../abstract";

function notImplemented(message: string) {
  warning(false, message);
}

export class LegacyCosmosMessages extends AbstractMessages<
  string | MultisigKey
> {
  protected constructor(protected override chainId: LegacyCosmosChainId) {
    super(chainId);
  }

  public toJSON(_: Message): MessageJson {
    notImplemented("toJSON not implemented for Cosmos");
    throw new Error("toJSON not implemented for Cosmos");
  }

  public wrapMessages(_: {
    messages: Message[];
    sender: string;
    userEntryContract: string;
    userEntryCodeHash?: string;
  }): Message[] {
    notImplemented("wrapMessages not implemented for Cosmos");
    return [];
  }

  public getSendMessages(_: {
    fromAddress: string;
    toAddress: string;
    tokens: Token[];
  }): Message[] {
    notImplemented("getSendMessages not implemented for Cosmos");
    return [];
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
  }): Message[] {
    notImplemented("getUpdateGatekeeperMessages not implemented for Cosmos");
    return [];
  }

  public getStakeMessage(_: {
    wallet: MultisigWallet;
    amount: Token;
    validator: string;
  }): Message {
    notImplemented("getStakeMessage not implemented for Cosmos");
    throw new Error("getStakeMessage not implemented for Cosmos");
  }

  public getUnstakeMessage(_: {
    wallet: MultisigWallet;
    amount: Token;
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

  public getFirstUpdateWalletMessage(
    _newOwner: MultisigKey,
    _newOwnerAddress: string,
    _userAccountContractAddress: string,
    _sender: string,
  ): Message {
    notImplemented("getFirstUpdateWalletMessage not implemented for Cosmos");
    throw new Error("getFirstUpdateWalletMessage not implemented for Cosmos");
  }

  public static chainId(chainId: LegacyCosmosChainId) {
    return new LegacyCosmosMessages(chainId);
  }
}
