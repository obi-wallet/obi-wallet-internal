import { MsgExecuteContract } from "secretjs";
import invariant from "tiny-invariant";
import warning from "tiny-warning";

import { SecretJsChainId, secretJsChains } from "../../../chains";
import {
  GatekeeperConfig,
  KeyType,
  MultisigKey,
  MultisigWallet,
} from "../../../data-structures";
import { Message, MessageJson } from "../../../transactions";
import { CodeIds, Token } from "../../common";
import { Sdk } from "../../sdk";
import { AbstractMessages } from "../abstract";

function notImplemented(message: string) {
  warning(false, message);
}

export class SecretJsMessages extends AbstractMessages {
  protected constructor(protected override chainId: SecretJsChainId) {
    super(chainId);
  }

  public toJSON(_: Message): MessageJson {
    notImplemented("toJSON not implemented for SecretJS");
    throw new Error("toJSON not implemented for SecretJS");
  }

  public wrapMessages(_: {
    messages: Message[];
    sender: string;
    contract: string;
  }): Message[] {
    notImplemented("wrapMessages not implemented for SecretJS");
    return [];
  }

  public getSendMessages(_: {
    fromAddress: string;
    toAddress: string;
    tokens: Token[];
  }): Message[] {
    notImplemented("getSendMessages not implemented for SecretJS");
    return [];
  }

  public getUpdateWalletMessage(_: {
    wallet: MultisigWallet;
    codeIds: CodeIds;
  }): Message {
    notImplemented("getUpdateWalletMessage not implemented for SecretJS");
    throw new Error("getUpdateWalletMessage not implemented for SecretJS");
  }

  public getProposeUpdateOwnerMessage(_: {
    wallet: MultisigWallet;
    newOwner: MultisigKey;
    codeIds: CodeIds;
  }): Message {
    notImplemented("getProposeUpdateOwnerMessage not implemented for SecretJS");
    throw new Error(
      "getProposeUpdateOwnerMessage not implemented for SecretJS",
    );
  }

  public getConfirmUpdateOwnerMessage(_: {
    wallet: MultisigWallet;
    newOwner: MultisigKey;
  }): Message {
    notImplemented("getConfirmUpdateOwnerMessage not implemented for SecretJS");
    throw new Error(
      "getConfirmUpdateOwnerMessage not implemented for SecretJS",
    );
  }

  public getUpdateGatekeeperMessages(_: {
    wallet: MultisigWallet;
    newGatekeeperConfig: GatekeeperConfig;
    spendLimitGatekeeper: string;
  }): Message[] {
    notImplemented("getUpdateGatekeeperMessages not implemented for SecretJS");
    return [];
  }

  public getStakeMessage(_: {
    wallet: MultisigWallet;
    amount: Token;
    validator: string;
  }): Message {
    notImplemented("getStakeMessage not implemented for SecretJS");
    throw new Error("getStakeMessage not implemented for SecretJS");
  }

  public getUnstakeMessage(_: {
    wallet: MultisigWallet;
    amount: Token;
    validator: string;
  }): Message {
    notImplemented("getUnstakeMessage not implemented for SecretJS");
    throw new Error("getUnstakeMessage not implemented for SecretJS");
  }

  public getWithdrawRewardsMessage(_: {
    wallet: MultisigWallet;
    validator: string;
  }): Message {
    notImplemented("getWithdrawRewardsMessage not implemented for SecretJS");
    throw new Error("getWithdrawRewardsMessage not implemented for SecretJS");
  }

  public getCreateWalletMessage(owner: MultisigKey): Message {
    const zAuthKey = owner.getKeyOfType(KeyType.ZAuth);
    invariant(zAuthKey, "Expected ZAuth key to be present");

    const address = this.sdk.transactions.getAddressOfPublicKey(
      zAuthKey.publicKey,
    );

    return new MsgExecuteContract({
      sender: address,
      contract_address: this.chain.accountCreator.address,
      msg: {
        new_account: {
          owner: address,
          signers: {
            signers: [
              {
                address: address,
                ty: "z-auth",
              },
            ],
          },
          update_delay: 0,
        },
      },
      code_hash: this.chain.accountCreator.codeHash,
    });
  }

  protected get chain() {
    return secretJsChains[this.chainId];
  }

  protected get sdk() {
    return Sdk.chainId(this.chainId);
  }

  public static chainId(chainId: SecretJsChainId) {
    return new SecretJsMessages(chainId);
  }
}
