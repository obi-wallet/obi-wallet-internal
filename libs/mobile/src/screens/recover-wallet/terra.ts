import {
  CodeIds,
  Draft,
  MultisigKey,
  MultisigWalletSerializedData,
  RequestObiSignAndBroadcastTerraTransactionMsg,
  terra,
} from "@obi-wallet/common";
import { TerraChain } from "@obi-wallet/sdk";

export async function handleTerra({
  draft,
  serializedData,
  codeIds,
  demoMode,
}: {
  draft: Draft<MultisigKey>;
  serializedData: MultisigWalletSerializedData.SerializedMultisigWalletData;
  codeIds: CodeIds;
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
      codeIds,
    });

    const response = await RequestObiSignAndBroadcastTerraTransactionMsg.send({
      chain: currentOwner.chain as TerraChain,
      messages: [message.toAmino()],
      demoMode,
      cancelable: true,
      multisigKey: currentOwner.serialize(),
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

    const response = await RequestObiSignAndBroadcastTerraTransactionMsg.send({
      chain: newOwner.chain as TerraChain,
      messages: [message.toAmino()],
      demoMode,
      cancelable: true,
      multisigKey: newOwner.serialize(),
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
