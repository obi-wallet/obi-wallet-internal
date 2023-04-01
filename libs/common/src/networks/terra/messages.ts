import {
  GatekeeperConfig,
  CodeIds,
  TerraChain,
  terraChains,
} from "@obi-wallet/sdk";
import {
  BlockTxBroadcastResult,
  Coin,
  MsgDelegate,
  MsgExecuteContract,
  MsgUndelegate,
  MsgWithdrawDelegatorReward,
} from "@terra-money/feather.js";
import { Duration } from "luxon";
import * as R from "ramda";
import invariant from "tiny-invariant";

export function parseProposeUpdateOwnerResponse(
  response: BlockTxBroadcastResult
) {
  try {
    const rawLog = JSON.parse(response.raw_log) as [
      {
        events: [
          {
            type: string;
            attributes: { key: string; value: string }[];
          }
        ];
      }
    ];
    const instantiateEvent = rawLog[0].events.find((e) => {
      return e.type === "execute";
    });
    invariant(
      instantiateEvent,
      "Expected `rawLog` to contain `execute` event."
    );
    const contractAddress = instantiateEvent.attributes.filter((a) => {
      return a.key === "_contract_address";
    });
    return {
      address: contractAddress[0].value,
    };
  } catch (e) {
    console.log(response.raw_log);
    throw e;
  }
}

export function getProposeUpdateOwnerMessage({
  sender,
  proxyAddress,
  newOwner,
  signers,
  codeIds,
}: {
  sender: string;
  proxyAddress: string;
  newOwner: string;
  signers: { address: string; ty: string }[];
  codeIds: CodeIds;
}) {
  const rawMessage = {
    propose_update_owner: {
      new_owner: newOwner,
      ...(codeIds.userAccount >= 1081
        ? {
            signers: {
              signers,
            },
          }
        : {}),
    },
  };
  return new MsgExecuteContract(sender, proxyAddress, rawMessage);
}

export function getConfirmUpdateOwnerMessage({
  sender,
  proxyAddress,
}: {
  sender: string;
  proxyAddress: string;
}) {
  const rawMessage = {
    confirm_update_owner: {},
  };
  return new MsgExecuteContract(sender, proxyAddress, rawMessage);
}

export function getStakeMessage({
  sender,
  validator,
  amount,
  chainId,
}: {
  sender: string;
  validator: string;
  amount: number;
  chainId: TerraChain;
}) {
  return new MsgDelegate(
    sender,
    validator,
    new Coin(terraChains[chainId].denom, amount)
  );
}

export function getUnstakeMessage({
  sender,
  validator,
  amount,
  chainId,
}: {
  sender: string;
  validator: string;
  amount: number;
  chainId: TerraChain;
}) {
  return new MsgUndelegate(
    sender,
    validator,
    new Coin(terraChains[chainId].denom, amount)
  );
}

export function getWithdrawRewardsMessage({
  sender,
  validator,
}: {
  sender: string;
  validator: string;
}) {
  return new MsgWithdrawDelegatorReward(sender, validator);
}

export function getUpdateGatekeeperMessages({
  currentGatekeeperConfig,
  newGatekeeperConfig,
  proxyAddress,
  spendLimitGatekeeper,
  sessionKeyGatekeeper,
}: {
  currentGatekeeperConfig: GatekeeperConfig;
  newGatekeeperConfig: GatekeeperConfig;
  proxyAddress: string;
  spendLimitGatekeeper: string;
  sessionKeyGatekeeper: string;
}) {
  function handleBeneficiaries() {
    const messages: MsgExecuteContract[] = [];

    const previousBeneficiaryAddresses =
      currentGatekeeperConfig.beneficiaries.map((beneficiary) => {
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
      const previousBeneficiary = currentGatekeeperConfig.beneficiaries.find(
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
        new MsgExecuteContract(proxyAddress, spendLimitGatekeeper, rawMessage)
      );
    });

    removedAddresses.forEach((address) => {
      const rawMessage = {
        rm_permissioned_address: {
          doomed_permissioned_address: address,
        },
      };
      messages.push(
        new MsgExecuteContract(proxyAddress, spendLimitGatekeeper, rawMessage)
      );
    });

    return messages;
  }

  function handleFlexAccounts() {
    const messages: MsgExecuteContract[] = [];

    const previousFlexAccountAddresses =
      currentGatekeeperConfig.flexAccounts.map((flexAccount) => {
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
      const previousFlexAccount = currentGatekeeperConfig.flexAccounts.find(
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
              proxyAddress,
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
              proxyAddress,
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
        new MsgExecuteContract(proxyAddress, spendLimitGatekeeper, rawMessage)
      );
    });

    removedAddresses.forEach((address) => {
      const rawMessage = {
        rm_permissioned_address: {
          doomed_permissioned_address: address,
        },
      };
      messages.push(
        new MsgExecuteContract(proxyAddress, spendLimitGatekeeper, rawMessage)
      );
    });

    return messages;
  }

  return [...handleBeneficiaries(), ...handleFlexAccounts()];
}
