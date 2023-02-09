import {
  Draft,
  MultisigKey,
  MultisigWalletSerializedData,
  RequestObiTerraSignAndBroadcastMsg,
  terra,
} from "@obi-wallet/common";

export async function handleTerra({
  draft,
  serializedData,
  demoMode,
}: {
  draft: Draft<MultisigKey>;
  serializedData: MultisigWalletSerializedData.SerializedMultisigWalletData;
  demoMode: boolean;
}) {
  const currentOwner = draft.original;
  const newOwner = draft.value;

  async function proposeUpdateOwner() {
    const signers = terra.getSigners({ multisigKey: newOwner });
    const message = terra.getProposeUpdateOwnerMessage({
      sender: currentOwner.address,
      proxyAddress: serializedData.proxyAddress.address,
      newOwner: newOwner.address,
      signers,
      codeId: serializedData.proxyAddress.codeId,
    });

    const response = await RequestObiTerraSignAndBroadcastMsg.send({
      multisigKey: currentOwner.serialize(),
      messages: [message.toAmino()],
      demoMode,
    });

    try {
      terra.parseProposeUpdateOwnerResponse(response);
    } catch (e) {
      await proposeUpdateOwner();
    }
  }

  async function confirmUpdateOwner() {
    const message = terra.getConfirmUpdateOwnerMessage({
      sender: newOwner.address,
      proxyAddress: serializedData.proxyAddress.address,
    });

    const response = await RequestObiTerraSignAndBroadcastMsg.send({
      multisigKey: newOwner.serialize(),
      messages: [message.toAmino()],
      demoMode,
    });

    try {
      terra.parseProposeUpdateOwnerResponse(response);
    } catch (e) {
      await confirmUpdateOwner();
    }
  }

  await proposeUpdateOwner();
  await confirmUpdateOwner();
}
