import { randomBytes } from "ethers";
import * as R from "ramda";
import {
  Msg,
  MsgBeginRedelegate,
  MsgDelegate,
  MsgExecuteContract,
  MsgInstantiateContract,
  MsgSend,
  MsgSetWithdrawAddress,
  MsgUndelegate,
  MsgWithdrawDelegatorReward,
} from "secretjs";
import invariant from "tiny-invariant";
import warning from "tiny-warning";

import { SecretJsChainId, SecretJsChains } from "../../../chains";
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

export class SecretJsMessages extends AbstractMessages<string> {
  protected constructor(protected override chainId: SecretJsChainId) {
    super(chainId);
  }

  public toJSON(message: Message): MessageJson {
    if (R.has("eth", message)) {
      return MessageJson.parse(message);
    }
    if (R.has("userop", message)) {
      return MessageJson.parse(message.userop);
    }
    if (R.has("raw", message)) {
      return MessageJson.parse(message);
    }
    if (R.has("hash", message)) {
      return MessageJson.parse(message);
    }
    throw new Error("Unknown message");
  }

  public wrapMessages({
    messages,
    sender,
    userEntryContract,
    userEntryCodeHash,
  }: {
    messages: Message[];
    sender: string;
    userEntryContract: string;
    userEntryCodeHash?: string;
  }): Message[] {
    return messages.map((msg) => {
      if (R.has("raw", msg)) {
        return;
      }
      if (R.has("eth", msg)) {
        return;
      }

      return new MsgExecuteContract({
        sender,
        contract_address: userEntryContract,
        code_hash: userEntryCodeHash!,
        msg: {
          execute: {
            msg: Buffer.from(
              JSON.stringify({ legacy: this.wrapMessage(msg as Msg) }),
            ).toString("base64"),
          },
        },
        sent_funds: [],
      });
    });
  }

  public wrapMessage(message: Message) {
    if (message instanceof MsgSend) {
      return {
        bank: {
          send: {
            amount: message.amount.map((coin) => {
              return {
                denom: coin.denom,
                amount: coin.amount.toString(),
              };
            }),
            from_address: message.from_address,
            to_address: message.to_address,
          },
        },
      };
    }

    if (message instanceof MsgDelegate) {
      return {
        staking: {
          delegate: {
            amount: this.wrapCoin(message.params.amount),
            validator: message.params.validator_address,
          },
        },
      };
    }

    if (message instanceof MsgBeginRedelegate) {
      return {
        staking: {
          redelegate: {
            amount: this.wrapCoin(message.params.amount),
            src_validator: message.params.validator_src_address,
            dst_validator: message.params.validator_dst_address,
          },
        },
      };
    }

    if (message instanceof MsgUndelegate) {
      return {
        staking: {
          undelegate: {
            amount: this.wrapCoin(message.params.amount),
            validator: message.params.validator_address,
          },
        },
      };
    }

    if (message instanceof MsgWithdrawDelegatorReward) {
      return {
        distribution: {
          withdraw_delegator_reward: {
            validator: message.params.validator_address,
          },
        },
      };
    }

    if (message instanceof MsgSetWithdrawAddress) {
      return {
        distribution: {
          set_withdraw_address: {
            address: message.params.withdraw_address,
          },
        },
      };
    }

    if (message instanceof MsgExecuteContract) {
      return {
        wasm: {
          execute: {
            contract_addr: message.contractAddress,
            code_hash: message.codeHash,
            funds: this.wrapCoins(message.sentFunds),
            msg: Buffer.from(JSON.stringify(message.msg)).toString("base64"),
          },
        },
      };
    }

    if (message instanceof MsgInstantiateContract) {
      return {
        wasm: {
          instantiate: {
            code_id: message.codeId,
            code_hash: message.codeHash,
            funds: this.wrapCoins(message.initFunds),
            label: message.label,
            msg: message.initMsg,
          },
        },
      };
    }

    throw new Error(
      `Unknown encode object: ` + JSON.stringify(message, null, 2),
    );
  }

  protected wrapCoins(coins: { amount: string; denom: string }[]) {
    return coins.map(this.wrapCoin.bind(this));
  }

  protected wrapCoin(coin: { amount: string; denom: string }) {
    return {
      denom: coin.denom,
      amount: coin.amount.toString(),
    };
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
    userAccountAddress,
    userAccountCodeHash,
    nexthashSignedBySigners,
  }: {
    wallet: MultisigWallet;
    newOwner: MultisigKey;
    userAccountAddress: string;
    userAccountCodeHash: string;
    nexthashSignedBySigners: string[];
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
          threshold: wallet.owner.threshold - 1,
        },
        signatures: nexthashSignedBySigners,
      },
    };
    return new MsgExecuteContract({
      sender: wallet.owner.address,
      contract_address: userAccountAddress,
      code_hash: userAccountCodeHash,
      msg: rawMessage,
    });
  }

  public getConfirmUpdateOwnerMessage({
    wallet,
    newOwner,
    userAccountAddress,
    userAccountCodeHash,
    nexthashSignedBySigners,
  }: {
    wallet: MultisigWallet;
    newOwner: MultisigKey;
    userAccountAddress: string;
    userAccountCodeHash: string;
    nexthashSignedBySigners: string[];
  }): Message {
    const _wallet = wallet;
    const rawMessage = {
      confirm_update_owner: {
        signatures: nexthashSignedBySigners,
      },
    };
    return new MsgExecuteContract({
      sender: newOwner.address,
      contract_address: userAccountAddress,
      code_hash: userAccountCodeHash,
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
            pubkey_base_64: key.payload.publicKey.value,
          };
        },
      );
    return addressAndTypes;
  }

  // TODO fix types as they are forced here
  public getCreateWalletMessage(...walletData: string[]): Message {
    const [ownerAddress, pubkeyBase64, sender] = walletData;
    invariant(ownerAddress, "ownerAddress is required");
    const message = new MsgExecuteContract({
      sender: sender ?? ownerAddress,
      contract_address: this.chain.accountCreator.address,
      code_hash: this.chain.accountCreator.codeHash,
      msg: {
        new_account: {
          owner: ownerAddress,
          signers: {
            signers: [
              {
                address: ownerAddress,
                ty: "creator",
                pubkey_base_64: pubkeyBase64,
              },
            ],
          },
          fee_debt: 0,
          update_delay: 0,
          // next_hash_seed is some randomness and doesn't need to be stored at all
          next_hash_seed: randomBytes(32).toString(),
        },
      },
    });
    console.log(JSON.stringify(message.msg));
    return message;
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
            signers: this.getSigners(
              newOwner.keys as unknown as Array<{
                type: string;
                payload: {
                  publicKey: PublicKey;
                  privateKey?: string;
                };
              }>,
            ),
            threshold: newOwner.threshold - 1,
          },
        },
      },
    });
    return message;
  }

  protected get chain() {
    return SecretJsChains[this.chainId];
  }

  protected get sdk() {
    return Sdk.chainId(this.chainId);
  }

  public static chainId(chainId: SecretJsChainId) {
    return new SecretJsMessages(chainId);
  }
}
