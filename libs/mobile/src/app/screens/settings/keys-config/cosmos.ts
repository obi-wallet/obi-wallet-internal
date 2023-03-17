import {
  MsgExecuteContractEncodeObject,
  MsgUpdateAdminEncodeObject,
} from "@cosmjs/cosmwasm-stargate";
import {
  cosmos,
  Draft,
  MultisigKey,
  MultisigWallet,
  RequestObiCosmosSignAndBroadcastMsg,
} from "@obi-wallet/common";
import { CosmosChain, Sdk } from "@obi-wallet/sdk";
import {
  MsgExecuteContract,
  MsgUpdateAdmin,
} from "cosmjs-types/cosmwasm/wasm/v1/tx";

export async function handleCosmos({
  draft,
  wallet,
  chainId,
}: {
  draft: Draft<MultisigKey>;
  wallet: MultisigWallet;
  chainId: CosmosChain;
}) {
  const currentOwner = draft.original;
  const newOwner = draft.value;

  async function proposeUpdateOwner() {
    const value: MsgUpdateAdmin = {
      sender: currentOwner.get().address,
      newAdmin: newOwner.get().address,
      contract: wallet.address,
    };
    const message: MsgUpdateAdminEncodeObject = {
      typeUrl: "/cosmwasm.wasm.v1.MsgUpdateAdmin",
      value,
    };

    const encodeObjects = [
      wrapRawMessage({
        rawMessage: {
          propose_update_admin: {
            new_admin: newOwner.get().address,
          },
        },
        sender: currentOwner.get().address,
        contract: wallet.address,
      }),
      ...(currentOwner.get().address === newOwner.get().address
        ? []
        : [message]),
    ];

    const response = await RequestObiCosmosSignAndBroadcastMsg.send({
      multisigKey: currentOwner.toJSON(),
      encodeObjects,
      demoMode: wallet.isDemo,
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
            signers: newOwner.get().keys.map((key) => {
              return Sdk.chainId(chainId).getAddressOfPublicKey({
                publicKey: key.publicKey,
              });
            }),
          },
        },
        sender: newOwner.get().address,
        contract: wallet.address,
      }),
    ];

    const response = await RequestObiCosmosSignAndBroadcastMsg.send({
      multisigKey: newOwner.toJSON(),
      encodeObjects,
      demoMode: wallet.isDemo,
    });

    try {
      cosmos.parseProposeUpdateOwnerResponse(response);
    } catch (e) {
      await confirmUpdateOwner();
    }
  }

  await proposeUpdateOwner();
  await confirmUpdateOwner();
  await wallet.setOwner(newOwner);
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
