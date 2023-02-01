import { MsgInstantiateContractEncodeObject } from "@cosmjs/cosmwasm-stargate";
import { DeliverTxResponse } from "@cosmjs/stargate";
import { InstantiateMsg } from "@obi-wallet/proxy-contract";
import { MsgInstantiateContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import invariant from "tiny-invariant";

import { CosmosChain, cosmosChains } from "../../chains";

export function getNewAccountMessage({
  address,
  signers,
  chainId,
}: {
  address: string;
  signers: { address: string; ty: string }[];
  chainId: CosmosChain;
}): MsgInstantiateContractEncodeObject {
  const { currentCodeId, debtRepayAddress, startingUsdDebt } =
    cosmosChains[chainId];

  const rawMessage: InstantiateMsg = {
    fee_lend_repay_wallet: debtRepayAddress,
    home_network: chainId,
    hot_wallets: [],
    owner: address,
    signer_types: signers.map((signer) => signer.ty),
    signers: signers.map((signer) => signer.address),
    uusd_fee_debt: startingUsdDebt,
  };

  const value: MsgInstantiateContract = {
    sender: address,
    admin: address,
    // @ts-expect-error should be passed as a string
    codeId: Long.fromInt(currentCodeId).toString(),
    label: "Obi Proxy",
    msg: new Uint8Array(Buffer.from(JSON.stringify(rawMessage))),
    funds: [],
  };

  return {
    typeUrl: "/cosmwasm.wasm.v1.MsgInstantiateContract",
    value,
  };
}

export function parseNewAccountResponse(response: DeliverTxResponse) {
  try {
    invariant(response.rawLog, "Expected `response` to have `rawLog`.");
    const rawLog = JSON.parse(response.rawLog) as [
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
    const contractAddress = instantiateEvent.attributes.find((a) => {
      return a.key === "_contract_address";
    });
    invariant(
      contractAddress,
      "Expected `instantiateEvent` to contain `_contract_address` attribute."
    );
    return {
      address: contractAddress.value,
    };
  } catch (e) {
    console.log(response.rawLog);
    throw e;
  }
}
