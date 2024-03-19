import {
  Coin,
  Coins,
  Msg,
  MsgBeginRedelegate,
  MsgClearContractAdmin,
  MsgDelegate,
  MsgExecuteContract,
  MsgInstantiateContract,
  MsgMigrateContract,
  MsgSend,
  MsgSetWithdrawAddress,
  MsgUndelegate,
  MsgUpdateContractAdmin,
  MsgWithdrawDelegatorReward,
} from "@terra-money/feather.js";
import * as R from "ramda";
import invariant from "tiny-invariant";

import { Chain, SecretJsChainId } from "../../../chains";
import { Key, MultisigKey } from "../../../data-structures";
import { SecretJsHomeChainId } from "../../../home-chains/secret-js";
import { Message, MessageJson } from "../../../transactions";
import { CodeIds, Token } from "../../common";
import { Sdk } from "../../sdk";
import { AbstractMessages } from "../abstract";

export class CosmosSdkMessages extends AbstractMessages<string> {
  public override getFirstUpdateWalletMessage(
    _newOwner: MultisigKey,
    _newOwnerAddress: string,
    _userAccountContractAddress: string,
    _sender: string,
  ): unknown {
    throw new Error("Method not implemented.");
  }
  protected constructor(protected override chainId: SecretJsChainId) {
    super(SecretJsHomeChainId.MAINNET);
  }

  public toJSON(message: Message): MessageJson & Msg.Amino {
    if (R.has("eth", message)) {
      return MessageJson.parse(message.eth) as MessageJson & Msg.Amino;
    }
    if (R.has("hash", message)) {
      return MessageJson.parse(message.hash) as MessageJson & Msg.Amino;
    }
    if (R.has("osmo", message)) {
      return MessageJson.parse(message.osmo) as MessageJson & Msg.Amino;
    }
    if (typeof (message as Msg).toAmino === "function") {
      return MessageJson.parse((message as Msg).toAmino()) as MessageJson &
        Msg.Amino;
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
    const _userEntryCodeHash = userEntryCodeHash;
    return messages.map((msg) => {
      if (R.has("osmo", msg)) {
        return new MsgExecuteContract(sender, userEntryContract, {
          execute: {
            msg: Buffer.from(
              JSON.stringify({ osmo: this.wrapOsmoMessage(msg) }),
            ).toString("base64"),
          },
        });
      }

      return new MsgExecuteContract(sender, userEntryContract, {
        execute: {
          msg: Buffer.from(
            JSON.stringify({ legacy: this.wrapMessage(msg as Msg) }),
          ).toString("base64"),
        },
      });
    });
  }

  public wrapOsmoMessage(message: { osmo: unknown }) {
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      swap_exact_amount_in: (message.osmo as any).value,
    };
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
            amount: this.wrapCoin(message.amount),
            validator: message.validator_address,
          },
        },
      };
    }

    if (message instanceof MsgBeginRedelegate) {
      return {
        staking: {
          redelegate: {
            amount: this.wrapCoin(message.amount),
            src_validator: message.validator_src_address,
            dst_validator: message.validator_dst_address,
          },
        },
      };
    }

    if (message instanceof MsgUndelegate) {
      return {
        staking: {
          undelegate: {
            amount: this.wrapCoin(message.amount),
            validator: message.validator_address,
          },
        },
      };
    }

    if (message instanceof MsgWithdrawDelegatorReward) {
      return {
        distribution: {
          withdraw_delegator_reward: {
            validator: message.validator_address,
          },
        },
      };
    }

    if (message instanceof MsgSetWithdrawAddress) {
      return {
        distribution: {
          set_withdraw_address: {
            address: message.withdraw_address,
          },
        },
      };
    }

    if (message instanceof MsgExecuteContract) {
      return {
        wasm: {
          execute: {
            contract_addr: message.contract,
            funds: this.wrapCoins(message.coins),
            msg: Buffer.from(JSON.stringify(message.execute_msg)).toString(
              "base64",
            ),
          },
        },
      };
    }

    if (message instanceof MsgInstantiateContract) {
      return {
        wasm: {
          instantiate: {
            admin: message.admin,
            code_id: message.code_id,
            funds: this.wrapCoins(message.init_coins),
            label: message.label,
            msg: message.init_msg,
          },
        },
      };
    }

    if (message instanceof MsgMigrateContract) {
      return {
        wasm: {
          migrate: {
            contract_addr: message.contract,
            msg: message.migrate_msg,
            new_code_id: message.new_code_id,
          },
        },
      };
    }

    if (message instanceof MsgUpdateContractAdmin) {
      return {
        wasm: {
          update_admin: {
            admin: message.new_admin,
            contract_addr: message.contract,
          },
        },
      };
    }

    if (message instanceof MsgClearContractAdmin) {
      return {
        wasm: {
          clear_admin: {
            contract_addr: message.contract,
          },
        },
      };
    }

    throw new Error(
      `Unknown encode object of type ${(message as Msg).toAmino().type}`,
    );
  }

  protected wrapCoins(coins: Coins) {
    return coins.map(this.wrapCoin.bind(this));
  }

  protected wrapCoin(coin: Coin) {
    return {
      denom: coin.denom,
      amount: coin.amount.toString(),
    };
  }

  public getSendMessages({
    fromAddress,
    toAddress,
    tokens,
  }: {
    fromAddress: string;
    toAddress: string;
    tokens: Token[];
  }): Message[] {
    const enrichedTokens = tokens.map((token) => {
      return this.sdk.bank.enrichToken(token);
    });
    const [contractTokens, nativeTokens] = R.partition(
      (token) => token.contract !== null,
      enrichedTokens,
    );
    const nativeCoinsMessages =
      nativeTokens.length > 0
        ? [
            new MsgSend(
              fromAddress,
              toAddress,
              R.fromPairs(
                nativeTokens.map((token) => [token.id, token.rawAmount]),
              ),
            ),
          ]
        : [];

    const contractTokensMessages = contractTokens.map((token) => {
      invariant(token.contract !== null, "Contract token must have contract");
      return new MsgExecuteContract(fromAddress, token.contract, {
        transfer: {
          recipient: toAddress,
          amount: token.rawAmount,
        },
      });
    });

    return [...nativeCoinsMessages, ...contractTokensMessages];
  }

  protected attachGatekeeperCodeIds(_codeIds: CodeIds) {
    return true;
  }

  public getCreateWalletMessage(...walletData: string[]): Message {
    /**
     * Replace with params if needed
     * @param ownerAddress
     * @param pubkeyBase64
     * @param sender
     */
    const [_] = walletData;
    throw new Error("not implemented");
    /* const _sender = sender;
    const rawMessage = {
      new_account: {
        fee_debt: parseInt(this.chain.startingUsdDebt, 10),
        gatekeeper_authorizations: {
          beneficiary_auths: [],
          message_auths: [],
          session_keys: [],
          spendlimit_auths: [],
        },
        owner: ownerAddress,
        signers: {
          signers: this.getSigners(owner),
        },
        update_delay: 0,
      },
    };

    return new MsgExecuteContract(
      owner.address,
      this.chain.accountCreatorAddress,
      rawMessage,
    ); */
  }

  protected getSigners(multisigKey: MultisigKey) {
    const addressAndTypes: Array<{ address: string; ty: string }> =
      multisigKey.keys.map((key: Key) => {
        return {
          address: this.sdk.transactions.getAddressOfPublicKey(key.publicKey),
          ty: key.type,
          pubkeyBase64: key.publicKey.value,
        };
      });
    return addressAndTypes;
  }

  protected get sdk() {
    return Sdk.chainId(SecretJsHomeChainId.MAINNET);
  }

  protected get chain() {
    return Chain.select<{
      accountCreatorAddress: string;
      currentCodeIds: {
        userAccount: number;
        spendLimitGatekeeper: number;
        debtGatekeeper: number;
      };
      startingUsdDebt: string;
    }>({
      /*onCosmosChain(chain) {
        return chain;
      },
      onLegacyCosmosChain() {
        throw new Error("Not a Cosmos SDK chain");
      },*/
      onSecretJsChain() {
        throw new Error("Not a Cosmos SDK chain");
      },
      /*onTerraChain(chain) {
        return chain;
      },*/
    });
  }

  protected getNextCodeId(_codeIds: CodeIds) {
    return this.chain.currentCodeIds.userAccount;
  }

  protected attachSigners() {
    return true;
  }

  public static chainId(_chainId: SecretJsChainId) {
    return new CosmosSdkMessages(SecretJsHomeChainId.MAINNET);
  }
}
