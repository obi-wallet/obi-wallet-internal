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
      sender: currentOwner.get().address,
      proxyAddress: serializedData.proxyAddress.address,
      newOwner: newOwner.get().address,
      signers,
      codeIds,
    });

    const response = await RequestObiSignAndBroadcastTerraTransactionMsg.send({
      chain: newOwner.get().chain as TerraChain,
      messages: [message.toAmino()],
      demoMode,
      cancelable: true,
      multisigKey: currentOwner.toJSON(),
    });

    try {
      terra.parseProposeUpdateOwnerResponse(response);
    } catch (e) {
      await proposeUpdateOwner();
    }
  }

  async function confirmUpdateOwner() {
    const message = terra.getConfirmUpdateOwnerMessage({
      sender: newOwner.get().address,
      proxyAddress: serializedData.proxyAddress.address,
    });

    const response = await RequestObiSignAndBroadcastTerraTransactionMsg.send({
      chain: newOwner.get().chain as TerraChain,
      messages: [message.toAmino()],
      demoMode,
      cancelable: true,
      multisigKey: newOwner.toJSON(),
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
