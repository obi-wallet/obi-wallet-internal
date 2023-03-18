import {
  MsgExecuteContractEncodeObject,
  MsgUpdateAdminEncodeObject,
} from "@cosmjs/cosmwasm-stargate";
import {
  cosmos,
  Draft,
  RequestObiCosmosSignAndBroadcastMsg,
} from "@obi-wallet/common";
import {
  CosmosChain,
  MultisigWallet,
  ObservableMultisigKey,
  Sdk,
  Serialized,
} from "@obi-wallet/sdk";
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
  draft: Draft<ObservableMultisigKey>;
  serializedData: Serialized<typeof MultisigWallet>["data"];
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
      multisigKey: currentOwner.toJSON(),
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
                publicKey: key.publicKey,
              });
            }),
          },
        },
        sender: newOwner.address,
        contract: serializedData.proxyAddress.address,
      }),
    ];

    const response = await RequestObiCosmosSignAndBroadcastMsg.send({
      multisigKey: newOwner.toJSON(),
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
