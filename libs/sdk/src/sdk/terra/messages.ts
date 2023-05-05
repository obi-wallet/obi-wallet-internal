import {
  Coin as TerraCoin,
  MsgDelegate,
  MsgExecuteContract,
  MsgSend,
  MsgUndelegate,
  MsgWithdrawDelegatorReward,
} from "@terra-money/feather.js";
import { Duration } from "luxon";
import * as R from "ramda";
import invariant from "tiny-invariant";

import { TerraChainId, terraChains } from "../../chains";
import {
  GatekeeperConfig,
  MultisigKey,
  MultisigWallet,
} from "../../data-structures";
import { Message } from "../../transactions";
import { AbstractMessages } from "../abstract";
import { CodeIds, Token } from "../common";
import { Sdk } from "../sdk";

export class TerraMessages extends AbstractMessages {
  protected constructor(protected chainId: TerraChainId) {
    super(chainId);
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
      enrichedTokens
    );
    const nativeCoinsMessages =
      nativeTokens.length > 0
        ? [
            new MsgSend(
              fromAddress,
              toAddress,
              R.fromPairs(
                nativeTokens.map((token) => [token.id, token.rawAmount])
              )
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
              code_id:
                codeIds.userAccount <= 1014
                  ? 1081
                  : this.chain.currentCodeIds.userAccount,
              ...(codeIds.userAccount >= 1081
                ? {
                    signers: {
                      signers: this.getSigners(wallet.owner),
                    },
                  }
                : {}),
            }
          : {}),
        ...(codeIds.userAccount >= 1261
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
        ...(codeIds.userAccount >= 1081
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
      rawMessage
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
      rawMessage
    );
  }

  public getUpdateGatekeeperMessages({
    wallet,
    newGatekeeperConfig,
    spendLimitGatekeeper,
    sessionKeyGatekeeper,
  }: {
    wallet: MultisigWallet;
    newGatekeeperConfig: GatekeeperConfig;
    spendLimitGatekeeper: string;
    sessionKeyGatekeeper: string;
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
        }
      );

      const removedAddresses = R.difference(
        previousBeneficiaryAddresses,
        nextBeneficiaryAddresses
      );

      newGatekeeperConfig.beneficiaries.forEach((beneficiary) => {
        const previousBeneficiary = wallet.gatekeeperConfig.beneficiaries.find(
          (previousBeneficiary) => {
            return previousBeneficiary.address === beneficiary.address;
          }
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
                "days"
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
            rawMessage
          )
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
            rawMessage
          )
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
        }
      );

      const removedAddresses = R.difference(
        previousFlexAccountAddresses,
        nextFlexAccountAddresses
      );

      newGatekeeperConfig.flexAccounts.forEach((flexAccount) => {
        const previousFlexAccount = wallet.gatekeeperConfig.flexAccounts.find(
          (previousFlexAccount) => {
            return previousFlexAccount.address === flexAccount.address;
          }
        );

        if (
          !previousFlexAccount ||
          !R.equals(
            flexAccount.remainingAutoSignDuration,
            previousFlexAccount.remainingAutoSignDuration
          )
        ) {
          if (flexAccount.autoSignEndTime) {
            const rawMessage = {
              create_session_key: {
                address: flexAccount.address,
                admin_permissions: true,
                max_duration: flexAccount.autoSignEndTime.toUnixInteger(),
                use_limit: 999,
              },
            };

            messages.push(
              new MsgExecuteContract(
                wallet.owner.address,
                sessionKeyGatekeeper,
                rawMessage
              )
            );
          } else if (
            previousFlexAccount?.hasActiveAutoSign &&
            !flexAccount.hasActiveAutoSign
          ) {
            const rawMessage = {
              destroy_session_key: {
                address: flexAccount.address,
              },
            };

            messages.push(
              new MsgExecuteContract(
                wallet.owner.address,
                sessionKeyGatekeeper,
                rawMessage
              )
            );
          }
        }

        if (previousFlexAccount && flexAccount.equals(previousFlexAccount)) {
          return;
        }

        const additionalProperties = (() => {
          if (flexAccount.spendLimit) {
            const { period } = flexAccount.spendLimit;

            const periodProperties = (() => {
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

            const amount = `${1_000_000 * flexAccount.spendLimit.amount}`;

            return {
              ...periodProperties,
              spend_limits: [
                {
                  amount,
                  current_balance: "0",
                  denom:
                    "ibc/B3504E092456BA618CC28AC671A71FB08C6CA0FD0BE7C8A5B5A3E2DD933CC9E4",
                  limit_remaining: amount,
                },
              ],
            };
          } else {
            return {
              period_multiple: 0,
              period_type: "days",
              spend_limits: [],
            };
          }
        })();

        const rawMessage = {
          upsert_permissioned_address: {
            new_permissioned_address: {
              address: flexAccount.address,
              cooldown: 0,
              inheritance_records: [],
              offset: 0,
              ...additionalProperties,
            },
          },
        };
        messages.push(
          new MsgExecuteContract(
            wallet.owner.address,
            spendLimitGatekeeper,
            rawMessage
          )
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
            rawMessage
          )
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
      new TerraCoin(amount.id, amount.rawAmount)
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
      new TerraCoin(amount.id, amount.rawAmount)
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

  public getCreateWalletMessage(owner: MultisigKey): Message {
    const rawMessage = {
      new_account: {
        fee_debt: parseInt(this.chain.startingUsdDebt, 10),
        gatekeeper_authorizations: {
          beneficiary_auths: [],
          message_auths: [],
          session_keys: [],
          spendlimit_auths: [],
        },
        owner: owner.address,
        signers: {
          signers: this.getSigners(owner),
        },
        update_delay: 0,
      },
    };

    return new MsgExecuteContract(
      owner.address,
      this.chain.accountCreatorAddress,
      rawMessage
    );
  }

  protected getSigners(multisigKey: MultisigKey) {
    const addresses = multisigKey.keys.map((key) => {
      return this.sdk.transactions.getAddressOfPublicKey(key.publicKey);
    });
    return R.zipWith(
      (address, ty) => {
        return { address, ty };
      },
      addresses,
      multisigKey.signerTypes
    );
  }

  protected get sdk() {
    return Sdk.chainId(this.chainId);
  }

  protected get chain() {
    return terraChains[this.chainId];
  }

  public static chainId(chainId: TerraChainId) {
    return new TerraMessages(chainId);
  }
}
