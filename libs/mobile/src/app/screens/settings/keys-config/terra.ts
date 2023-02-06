import {
  Draft,
  MultisigKey,
  MultisigWallet,
  RequestObiTerraSignAndBroadcastMsg,
  terra,
} from "@obi-wallet/common";

export async function handleTerra({
  draft,
  wallet,
}: {
  draft: Draft<MultisigKey>;
  wallet: MultisigWallet;
}) {
  const currentOwner = draft.original;
  const newOwner = draft.value;

  async function proposeUpdateOwner() {
    const signers = terra.getSigners({ multisigKey: currentOwner });
    const message = terra.getProposeUpdateOwnerMessage({
      sender: currentOwner.address,
      proxyAddress: wallet.address,
      newOwner: newOwner.address,
      signers,
      codeId: wallet.proxyAddress.codeId,
    });

    const response = await RequestObiTerraSignAndBroadcastMsg.send({
      multisigKey: currentOwner.serialize(),
      messages: [message.toAmino()],
      demoMode: wallet.isDemo,
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
      proxyAddress: wallet.address,
    });

    const response = await RequestObiTerraSignAndBroadcastMsg.send({
      multisigKey: newOwner.serialize(),
      messages: [message.toAmino()],
      demoMode: wallet.isDemo,
    });

    try {
      terra.parseProposeUpdateOwnerResponse(response);
    } catch (e) {
      await confirmUpdateOwner();
    }
  }

  await proposeUpdateOwner();
  await confirmUpdateOwner();
  await wallet.setOwner(newOwner);
}
