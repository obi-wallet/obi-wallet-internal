import {
  BlockTxBroadcastResult,
  Coin,
  MsgDelegate,
  MsgExecuteContract,
  MsgUndelegate,
  MsgWithdrawDelegatorReward,
} from "@terra-money/terra.js";
import invariant from "tiny-invariant";

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
