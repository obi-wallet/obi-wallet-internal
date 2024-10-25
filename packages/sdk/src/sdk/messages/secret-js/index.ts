import { MsgExecuteContract } from "secretjs";

import { MultisigKey } from "../../../data-structures";
import { SecretJsHomeChainId } from "../../../home-chains";
import { Message } from "../../../transactions";
import { Sdk } from "../../sdk";
import { AbstractMessages } from "../abstract";

export class SecretJsMessages extends AbstractMessages {
  protected constructor(protected override chainId: SecretJsHomeChainId) {
    super(chainId);
  }

  protected getSigners(multisigKey: MultisigKey) {
    console.warn("getting signers...");
    const addressAndTypes: Array<{ address: string; ty: string }> =
      multisigKey.keys.map((key) => {
        return {
          address: this.sdk.transactions.getAddressOfPublicKey(key.publicKey),
          ty: key.type,
          pubkey_base_64: key.publicKey.value,
        };
      });
    return addressAndTypes;
  }

  // TODO fix types as they are forced here
  public getFirstUpdateWalletMessage(
    newOwner: MultisigKey,
    newOwnerAddress: string,
    userAccountContractAddress: string,
    userAccountCodeHash: string,
    sender: string,
  ): Message {
    const message = new MsgExecuteContract({
      sender: sender,
      contract_address: userAccountContractAddress,
      code_hash: userAccountCodeHash,
      msg: {
        first_update_owner: {
          first_owner: newOwnerAddress,
          evm_contract_address: "",
          evm_signing_address: "",
          signers: {
            signers: this.getSigners(newOwner),
            threshold: newOwner.threshold - 1,
          },
        },
      },
    });
    return message;
  }

  public getProposeUpdateOwnerMessage(
    newOwner: MultisigKey,
    userAccountContractAddress: string,
    userAccountCodeHash: string,
    sender: string,
    signatures: string[],
  ): Message {
    const message = new MsgExecuteContract({
      sender: sender,
      contract_address: userAccountContractAddress,
      code_hash: userAccountCodeHash,
      msg: {
        propose_update_owner: {
          new_owner: newOwner.address,
          signers: {
            signers: this.getSigners(newOwner),
            threshold: newOwner.threshold - 1,
          },
          signatures,
        },
      },
    });
    return message;
  }

  public getConfirmUpdateOwnerMessage(
    userAccountContractAddress: string,
    userAccountCodeHash: string,
    sender: string,
    signatures: string[],
  ): Message {
    const message = new MsgExecuteContract({
      sender: sender,
      contract_address: userAccountContractAddress,
      code_hash: userAccountCodeHash,
      msg: {
        confirm_update_owner: {
          signatures,
        },
      },
    });
    return message;
  }

  protected get sdk() {
    return Sdk.chainId(this.chainId);
  }

  public static chainId(chainId: SecretJsHomeChainId) {
    return new SecretJsMessages(chainId);
  }
}
