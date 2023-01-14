import {
  BlockTxBroadcastResult,
  MsgExecuteContract,
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

  return MsgExecuteContract.fromProto({
    sender: address,
    contract: accountCreatorAddress,
    msg: new Uint8Array(Buffer.from(JSON.stringify(rawMessage))),
    funds: [],
  });
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
    invariant(
      contractAddresses.length >= 2,
      "Expected `instantiateEvent` to contain at least two `_contract_address` attributes."
    );
    return {
      address: contractAddresses[contractAddresses.length - 2].value,
      codeId: parseInt(codeIds[codeIds.length - 2].value, 10),
    };
  } catch (e) {
    console.log(response.raw_log);
    throw e;
  }
}
