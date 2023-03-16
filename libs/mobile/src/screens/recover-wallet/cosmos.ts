import {
  MsgExecuteContractEncodeObject,
  MsgUpdateAdminEncodeObject,
} from "@cosmjs/cosmwasm-stargate";
import {
  cosmos,
  Draft,
  MultisigKey,
  MultisigWalletSerializedData,
  RequestObiCosmosSignAndBroadcastMsg,
} from "@obi-wallet/common";
import { CosmosChain, Sdk } from "@obi-wallet/sdk";
import {
  MsgExecuteContract,
  MsgUpdateAdmin,
} from "cosmjs-types/cosmwasm/wasm/v1/tx";

export async function handleCosmos({
  draft,
  serializedData,
  demoMode,
  chainId,
}: {
  draft: Draft<MultisigKey>;
  serializedData: MultisigWalletSerializedData.SerializedMultisigWalletData;
  demoMode: boolean;
  chainId: CosmosChain;
}) {
  const currentOwner = draft.original;
  const newOwner = draft.value;

  async function proposeUpdateOwner() {
    const value: MsgUpdateAdmin = {
      sender: currentOwner.address,
      newAdmin: newOwner.address,
      contract: serializedData.proxyAddress.address,
    };
    const message: MsgUpdateAdminEncodeObject = {
      typeUrl: "/cosmwasm.wasm.v1.MsgUpdateAdmin",
      value,
    };

    const encodeObjects = [
      wrapRawMessage({
        rawMessage: {
          propose_update_admin: {
            new_admin: newOwner.address,
          },
        },
        sender: currentOwner.address,
        contract: serializedData.proxyAddress.address,
      }),
      ...(currentOwner.address === newOwner.address ? [] : [message]),
    ];

    const response = await RequestObiCosmosSignAndBroadcastMsg.send({
      multisigKey: currentOwner.serialize(),
      encodeObjects,
      demoMode,
    });

    try {
      cosmos.parseProposeUpdateOwnerResponse(response);
    } catch (e) {
      await proposeUpdateOwner();
    }
  }

  async function confirmUpdateOwner() {
    const encodeObjects = [
      wrapRawMessage({
        rawMessage: {
          confirm_update_admin: {
            signers: newOwner.keys.map((key) => {
              return Sdk.chainId(chainId).getAddressOfPublicKey({
                publicKey: key.payload.publicKey,
              });
            }),
          },
        },
        sender: newOwner.address,
        contract: serializedData.proxyAddress.address,
      }),
    ];

    const response = await RequestObiCosmosSignAndBroadcastMsg.send({
      multisigKey: newOwner.serialize(),
      encodeObjects,
      demoMode,
    });

    try {
      cosmos.parseProposeUpdateOwnerResponse(response);
    } catch (e) {
      await confirmUpdateOwner();
    }
  }

  await proposeUpdateOwner();
  await confirmUpdateOwner();
}

function wrapRawMessage({
  rawMessage,
  contract,
  sender,
}: {
  rawMessage: unknown;
  contract: string;
  sender: string;
}): MsgExecuteContractEncodeObject {
  const value: MsgExecuteContract = {
    sender,
    contract,
    msg: new Uint8Array(Buffer.from(JSON.stringify(rawMessage))),
    funds: [],
  };
  return {
    typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
    value,
  };
}
