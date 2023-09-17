import * as R from "ramda";
import { MsgExecuteContract } from "secretjs";
import warning from "tiny-warning";

import { SecretJsChainId, secretJsChains } from "../../../chains";
import {
  GatekeeperConfig,
  MultisigKey,
  MultisigWallet,
} from "../../../data-structures";
import { PublicKey } from "../../../keys";
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

  public toJSON(message: Message): MessageJson {
    if (R.has("eth", message)) {
      return MessageJson.parse(message.eth);
    }
    if (R.has("userop", message)) {
      return MessageJson.parse(message.userop);
    }
    throw new Error("Unknown message");
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

  public getProposeUpdateOwnerMessage({
    wallet,
    newOwner,
  }: {
    wallet: MultisigWallet;
    newOwner: MultisigKey;
  }): Message {
    const rawMessage = {
      propose_update_owner: {
        new_owner: newOwner.address,
        signers: {
          signers: this.getSigners(
            newOwner.keys as unknown as Array<{
              type: string;
              payload: {
                publicKey: PublicKey;
                privateKey?: string;
              };
            }>,
          ),
        },
      },
    };
    return new MsgExecuteContract({
      sender: wallet.owner.address,
      contract_address: wallet.proxyAddress,
      // code hash not added yet
      msg: rawMessage,
    });
  }

  public getConfirmUpdateOwnerMessage({
    wallet,
    newOwner,
  }: {
    wallet: MultisigWallet;
    newOwner: MultisigKey;
  }): Message {
    const rawMessage = {
      confirm_update_owner: {},
    };
    return new MsgExecuteContract({
      sender: newOwner.address,
      contract_address: wallet.proxyAddress,
      msg: rawMessage,
    });
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

  protected getSigners(
    multisigKey: Array<{
      type: string;
      payload: {
        publicKey: PublicKey;
        // TODO: remove
        privateKey?: string;
      };
    }>,
  ) {
    console.warn("getting signers...");
    const addressAndTypes: Array<{ address: string; ty: string }> =
      multisigKey.map(
        (key: {
          type: string;
          payload: {
            publicKey: PublicKey;
          };
        }) => {
          return {
            address: this.sdk.transactions.getAddressOfPublicKey(
              key.payload.publicKey,
            ),
            ty: key.type,
          };
        },
      );
    return addressAndTypes;
  }

  // TODO fix types as they are forced here
  public getCreateWalletMessage(owner: MultisigKey, ownerAddress: string, sender: string): Message {
    console.warn(
      "owner multisigkey address getting passed in is: " +
        JSON.stringify(owner),
    );
    const message = new MsgExecuteContract({
      sender: sender ?? owner.address,
      contract_address: this.chain.accountCreator.address,
      code_hash: this.chain.accountCreator.codeHash,
      msg: {
        new_account: {
          owner: ownerAddress,
          signers: {
            signers: this.getSigners(
              owner.keys as unknown as Array<{
                type: string;
                payload: {
                  publicKey: PublicKey;
                  privateKey?: string;
                };
              }>,
            ),
          },
          update_delay: 0,
        },
      },
    });
    return message;
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
