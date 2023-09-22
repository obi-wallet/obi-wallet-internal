import {
  Coin,
  Coin as TerraCoin,
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
import { DateTime, Duration } from "luxon";
import * as R from "ramda";
import invariant from "tiny-invariant";

import { Chain, CosmosChainId, TerraChainId } from "../../../chains";
import {
  GatekeeperConfig,
  Key,
  MultisigKey,
  MultisigWallet,
} from "../../../data-structures";
import { Message, MessageJson } from "../../../transactions";
import { CodeIds, Token } from "../../common";
import { Sdk } from "../../sdk";
import { AbstractMessages } from "../abstract";

export class CosmosSdkMessages extends AbstractMessages<string> {
  public override getFirstUpdateWalletMessage(
    newOwner: MultisigKey,
    newOwnerAddress: string,
    userAccountContractAddress: string,
    sender: string,
  ): unknown {
    throw new Error("Method not implemented.");
  }
  protected constructor(
    protected override chainId: CosmosChainId | TerraChainId,
  ) {
    super(chainId);
  }

  public toJSON(message: Message): MessageJson & Msg.Amino {
    if (R.has("eth", message)) {
      return MessageJson.parse(message.eth) as MessageJson & Msg.Amino;
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

  public getUpdateWalletMessage({
    wallet,
    codeIds,
  }: {
    wallet: MultisigWallet;
    codeIds: CodeIds;
  }): Message {
    return new MsgExecuteContract(wallet.owner.address, wallet.proxyAddress, {
      wrapped_migrate: {
        ...(codeIds.userAccount < this.chain.currentCodeIds.userAccount
          ? {
              code_id: this.getNextCodeId(codeIds),
              ...(this.attachSigners(codeIds)
                ? {
                    signers: {
                      signers: this.getSigners(wallet.owner),
                    },
                  }
                : {}),
            }
          : {}),
        ...(this.attachGatekeeperCodeIds(codeIds)
          ? {
              gatekeeper_code_ids: {
                ...(!codeIds.spendLimitGatekeeper ||
                codeIds.spendLimitGatekeeper <
                  this.chain.currentCodeIds.spendLimitGatekeeper
                  ? {
                      spendlimit:
                        this.chain.currentCodeIds.spendLimitGatekeeper,
                    }
                  : {}),
                ...(!codeIds.debtGatekeeper ||
                codeIds.debtGatekeeper <
                  this.chain.currentCodeIds.debtGatekeeper
                  ? {
                      debt: this.chain.currentCodeIds.debtGatekeeper,
                    }
                  : {}),
              },
            }
          : {}),
      },
    });
  }

  protected attachGatekeeperCodeIds(codeIds: CodeIds) {
    if (this.chainId === "phoenix-1") {
      if (codeIds.userAccount < 1261) return false;
    }

    return true;
  }

  public getProposeUpdateOwnerMessage({
    wallet,
    newOwner,
    codeIds,
  }: {
    wallet: MultisigWallet;
    newOwner: MultisigKey;
    codeIds: CodeIds;
  }): Message {
    const rawMessage = {
      propose_update_owner: {
        new_owner: newOwner.address,
        ...(this.attachSigners(codeIds)
          ? {
              signers: {
                signers: this.getSigners(newOwner),
              },
            }
          : {}),
      },
    };
    return new MsgExecuteContract(
      wallet.owner.address,
      wallet.proxyAddress,
      rawMessage,
    );
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
    return new MsgExecuteContract(
      newOwner.address,
      wallet.proxyAddress,
      rawMessage,
    );
  }

  public getUpdateGatekeeperMessages({
    wallet,
    newGatekeeperConfig,
    spendLimitGatekeeper,
  }: {
    wallet: MultisigWallet;
    newGatekeeperConfig: GatekeeperConfig;
    spendLimitGatekeeper: string;
  }): Message[] {
    function handleBeneficiaries() {
      const messages: MsgExecuteContract[] = [];

      const previousBeneficiaryAddresses =
        wallet.gatekeeperConfig.beneficiaries.map((beneficiary) => {
          return beneficiary.address;
        });
      const nextBeneficiaryAddresses = newGatekeeperConfig.beneficiaries.map(
        (beneficiary) => {
          return beneficiary.address;
        },
      );

      const removedAddresses = R.difference(
        previousBeneficiaryAddresses,
        nextBeneficiaryAddresses,
      );

      newGatekeeperConfig.beneficiaries.forEach((beneficiary) => {
        const previousBeneficiary = wallet.gatekeeperConfig.beneficiaries.find(
          (previousBeneficiary) => {
            return previousBeneficiary.address === beneficiary.address;
          },
        );

        if (previousBeneficiary && beneficiary.equals(previousBeneficiary)) {
          return;
        }

        const periodProperties = (() => {
          const { period } = beneficiary.dripSchedule;

          if (R.has("days", period)) {
            return {
              period_multiple: period.days,
              period_type: "days",
            };
          } else if (R.has("months", period)) {
            return {
              period_multiple: period.months,
              period_type: "months",
            };
          } else {
            return {
              period_multiple: period.years * 12,
              period_type: "months",
            };
          }
        })();

        const rawMessage = {
          upsert_beneficiary: {
            new_beneficiary: {
              address: beneficiary.address,
              cooldown: Duration.fromObject(beneficiary.dormancyThreshold).as(
                "days",
              ),
              inheritance_records: [],
              offset: 0,
              ...periodProperties,
              spend_limits: [
                {
                  amount: `${Math.floor(beneficiary.dripSchedule.rate * 100)}`,
                  current_balance: "0",
                  limit_remaining: "0",
                  denom: "PERCENT",
                },
              ],
            },
          },
        };

        messages.push(
          new MsgExecuteContract(
            wallet.owner.address,
            spendLimitGatekeeper,
            rawMessage,
          ),
        );
      });

      removedAddresses.forEach((address) => {
        const rawMessage = {
          rm_permissioned_address: {
            doomed_permissioned_address: address,
          },
        };
        messages.push(
          new MsgExecuteContract(
            wallet.owner.address,
            spendLimitGatekeeper,
            rawMessage,
          ),
        );
      });

      return messages;
    }

    function handleFlexAccounts() {
      const messages: MsgExecuteContract[] = [];

      const previousFlexAccountAddresses =
        wallet.gatekeeperConfig.flexAccounts.map((flexAccount) => {
          return flexAccount.address;
        });
      const nextFlexAccountAddresses = newGatekeeperConfig.flexAccounts.map(
        (flexAccount) => {
          return flexAccount.address;
        },
      );

      const removedAddresses = R.difference(
        previousFlexAccountAddresses,
        nextFlexAccountAddresses,
      );

      newGatekeeperConfig.flexAccounts.forEach((flexAccount) => {
        const expiration = DateTime.utc().plus({ minutes: 30 });
        const amount = `${Math.floor(
          1_000_000 * (flexAccount.spendLimit?.amount ?? 0),
        )}`;

        const rawMessage = {
          add_abstraction_rule: {
            new_rule: {
              actor: flexAccount.address,
              ty: "sessionkey",
              main_rule: {
                session_key: {
                  expiration: expiration.toUnixInteger(),
                  admin_permissions: false,
                },
              },
              sub_rules: [
                [
                  "spendlimit",
                  {
                    spendlimit: {
                      address: flexAccount.address,
                      cooldown: 0,
                      inheritance_records: [],
                      offset: 0,
                      period_multiple: 1,
                      period_type: "days",
                      spend_limits: [
                        {
                          amount: amount,
                          current_balance: "0",
                          limit_remaining: amount,
                          denom: "uosmo",
                        },
                      ],
                    },
                  },
                ],
              ],
            },
          },
        };
        messages.push(
          new MsgExecuteContract(
            wallet.owner.address,
            wallet.proxyAddress,
            rawMessage,
          ),
        );
        //
        //
        //
        //
        // const previousFlexAccount = wallet.gatekeeperConfig.flexAccounts.find(
        //   (previousFlexAccount) => {
        //     return previousFlexAccount.address === flexAccount.address;
        //   }
        // );
        //
        // if (
        //   !previousFlexAccount ||
        //   !R.equals(
        //     flexAccount.remainingAutoSignDuration,
        //     previousFlexAccount.remainingAutoSignDuration
        //   )
        // ) {
        //   if (flexAccount.autoSignEndTime) {
        //     const rawMessage = {
        //       create_session_key: {
        //         address: flexAccount.address,
        //         admin_permissions: true,
        //         max_duration: flexAccount.autoSignEndTime.toUnixInteger(),
        //         use_limit: 999,
        //       },
        //     };
        //
        //     messages.push(
        //       new MsgExecuteContract(
        //         wallet.owner.address,
        //         sessionKeyGatekeeper,
        //         rawMessage
        //       )
        //     );
        //   } else if (
        //     previousFlexAccount?.hasActiveAutoSign &&
        //     !flexAccount.hasActiveAutoSign
        //   ) {
        //     const rawMessage = {
        //       destroy_session_key: {
        //         address: flexAccount.address,
        //       },
        //     };
        //
        //     messages.push(
        //       new MsgExecuteContract(
        //         wallet.owner.address,
        //         sessionKeyGatekeeper,
        //         rawMessage
        //       )
        //     );
        //   }
        // }
        //
        // if (previousFlexAccount && flexAccount.equals(previousFlexAccount)) {
        //   return;
        // }
        //
        // const additionalProperties = (() => {
        //   if (flexAccount.spendLimit) {
        //     const { period } = flexAccount.spendLimit;
        //
        //     const periodProperties = (() => {
        //       if (R.has("days", period)) {
        //         return {
        //           period_multiple: period.days,
        //           period_type: "days",
        //         };
        //       } else if (R.has("months", period)) {
        //         return {
        //           period_multiple: period.months,
        //           period_type: "months",
        //         };
        //       } else {
        //         return {
        //           period_multiple: period.years * 12,
        //           period_type: "months",
        //         };
        //       }
        //     })();
        //
        //     const amount = `${1_000_000 * flexAccount.spendLimit.amount}`;
        //
        //     return {
        //       ...periodProperties,
        //       spend_limits: [
        //         {
        //           amount,
        //           current_balance: "0",
        //           denom:
        //             "ibc/B3504E092456BA618CC28AC671A71FB08C6CA0FD0BE7C8A5B5A3E2DD933CC9E4",
        //           limit_remaining: amount,
        //         },
        //       ],
        //     };
        //   } else {
        //     return {
        //       period_multiple: 0,
        //       period_type: "days",
        //       spend_limits: [],
        //     };
        //   }
        // })();
        //
        // const rawMessage = {
        //   upsert_permissioned_address: {
        //     new_permissioned_address: {
        //       address: flexAccount.address,
        //       cooldown: 0,
        //       inheritance_records: [],
        //       offset: 0,
        //       ...additionalProperties,
        //     },
        //   },
        // };
        // messages.push(
        //   new MsgExecuteContract(
        //     wallet.owner.address,
        //     spendLimitGatekeeper,
        //     rawMessage
        //   )
        // );
      });

      removedAddresses.forEach((address) => {
        const rawMessage = {
          rm_permissioned_address: {
            doomed_permissioned_address: address,
          },
        };
        messages.push(
          new MsgExecuteContract(
            wallet.owner.address,
            spendLimitGatekeeper,
            rawMessage,
          ),
        );
      });

      return messages;
    }

    return [...handleBeneficiaries(), ...handleFlexAccounts()];
  }

  public getStakeMessage({
    wallet,
    amount,
    validator,
  }: {
    wallet: MultisigWallet;
    amount: Token;
    validator: string;
  }): Message {
    return new MsgDelegate(
      wallet.address,
      validator,
      new TerraCoin(amount.id, amount.rawAmount),
    );
  }

  public getUnstakeMessage({
    wallet,
    amount,
    validator,
  }: {
    wallet: MultisigWallet;
    amount: Token;
    validator: string;
  }): Message {
    return new MsgUndelegate(
      wallet.address,
      validator,
      new TerraCoin(amount.id, amount.rawAmount),
    );
  }

  public getWithdrawRewardsMessage({
    wallet,
    validator,
  }: {
    wallet: MultisigWallet;
    validator: string;
  }): Message {
    return new MsgWithdrawDelegatorReward(wallet.address, validator);
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
    return Sdk.chainId(this.chainId);
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
      chainId: this.chainId,
      onCosmosChain(chain) {
        return chain;
      },
      onLegacyCosmosChain() {
        throw new Error("Not a Cosmos SDK chain");
      },
      onSecretJsChain() {
        throw new Error("Not a Cosmos SDK chain");
      },
      onTerraChain(chain) {
        return chain;
      },
    });
  }

  protected getNextCodeId(codeIds: CodeIds) {
    if (this.chainId === "phoenix-1") {
      if (codeIds.userAccount <= 1014) return 1081;
    }

    return this.chain.currentCodeIds.userAccount;
  }

  protected attachSigners(codeIds: CodeIds) {
    if (this.chainId === "phoenix-1") {
      if (codeIds.userAccount < 1081) return false;
    }

    return true;
  }

  public static chainId(chainId: CosmosChainId | TerraChainId) {
    return new CosmosSdkMessages(chainId);
  }
}
