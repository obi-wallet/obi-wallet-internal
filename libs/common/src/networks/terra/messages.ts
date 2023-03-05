import {
  BlockTxBroadcastResult,
  Coin,
  MsgDelegate,
  MsgExecuteContract,
  MsgUndelegate,
  MsgWithdrawDelegatorReward,
} from "@terra-money/terra.js";
import * as R from "ramda";
import invariant from "tiny-invariant";

import { Draft, GatekeeperConfig, withLcdClient } from "../..";
import { TerraChain, terraChains } from "../../chains";

export function getNewAccountMessage({
  address,
  signers,
  chainId,
}: {
  address: string;
  signers: { address: string; ty: string }[];
  chainId: TerraChain;
}): MsgExecuteContract {
  const { accountCreatorAddress, startingUsdDebt } = terraChains[chainId];

  const rawMessage = {
    new_account: {
      fee_debt: parseInt(startingUsdDebt, 10),
      gatekeeper_authorizations: {
        beneficiary_auths: [],
        message_auths: [],
        session_keys: [],
        spendlimit_auths: [],
      },
      owner: address,
      signers: {
        signers,
      },
      update_delay: 0,
    },
  };

  return new MsgExecuteContract(address, accountCreatorAddress, rawMessage);
}

export function parseNewAccountResponse(response: BlockTxBroadcastResult) {
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
      return e.type === "instantiate";
    });
    invariant(
      instantiateEvent,
      "Expected `rawLog` to contain `instantiate` event."
    );
    const contractAddresses = instantiateEvent.attributes.filter((a) => {
      return a.key === "_contract_address";
    });
    const codeIds = instantiateEvent.attributes.filter((a) => {
      return a.key === "code_id";
    });
    invariant(
      contractAddresses.length === codeIds.length,
      "Expected to have the same number of `_contract_address` and `code_id` attributes."
    );
    return {
      address: contractAddresses[0].value,
      codeId: parseInt(codeIds[0].value, 10),
    };
  } catch (e) {
    console.log(response.raw_log);
    throw e;
  }
}

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

export function getMigrateMessage({
  proxyAddress,
  admin,
  chainId,
  signers,
  codeId,
}: {
  admin: string;
  proxyAddress: string;
  chainId: TerraChain;
  signers: { address: string; ty: string }[];
  codeId: number;
}) {
  return new MsgExecuteContract(admin, proxyAddress, {
    wrapped_migrate: {
      code_id: terraChains[chainId].currentCodeId,
      ...(codeId >= 1081
        ? {
            signers: {
              signers,
            },
          }
        : {}),
    },
  });
}

export function getProposeUpdateOwnerMessage({
  sender,
  proxyAddress,
  newOwner,
  signers,
  codeId,
}: {
  sender: string;
  proxyAddress: string;
  newOwner: string;
  signers: { address: string; ty: string }[];
  codeId: number;
}) {
  const rawMessage = {
    propose_update_owner: {
      new_owner: newOwner,
      ...(codeId >= 1081
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
}: {
  currentGatekeeperConfig: GatekeeperConfig;
  newGatekeeperConfig: GatekeeperConfig;
  proxyAddress: string;
  spendLimitGatekeeper: string;
}) {
  function handleFlexAccounts() {
    const messages: MsgExecuteContract[] = [];

    const previousFlexAccountAddresses =
      currentGatekeeperConfig.flexAccounts.entities.map((flexAccount) => {
        return flexAccount.address;
      });
    const nextFlexAccountAddresses =
      newGatekeeperConfig.flexAccounts.entities.map((flexAccount) => {
        return flexAccount.address;
      });

    const removedAddresses = R.difference(
      previousFlexAccountAddresses,
      nextFlexAccountAddresses
    );

    newGatekeeperConfig.flexAccounts.entities.forEach((flexAccount) => {
      const previousFlexAccount =
        currentGatekeeperConfig.flexAccounts.entities.find(
          (previousFlexAccount) => {
            return previousFlexAccount.address === flexAccount.address;
          }
        );

      if (
        previousFlexAccount &&
        R.equals(
          R.omit(["autoSign"], previousFlexAccount),
          R.omit(["autoSign"], flexAccount)
        )
      ) {
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

  return [...handleFlexAccounts()];
}
