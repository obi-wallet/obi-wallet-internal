import {
  CodeIds,
  Draft,
  MultisigWallet,
  RequestObiSignAndBroadcastTerraTransactionMsg,
  terra,
} from "@obi-wallet/common";
import { ObservableMultisigKey, TerraChain } from "@obi-wallet/sdk";

export async function handleTerra({
  draft,
  wallet,
  codeIds,
}: {
  draft: Draft<ObservableMultisigKey>;
  wallet: MultisigWallet;
  codeIds: CodeIds;
}) {
  const currentOwner = draft.original;
  const newOwner = draft.value;

  async function proposeUpdateOwner() {
    const signers = terra.getSigners({ multisigKey: newOwner });
    const message = terra.getProposeUpdateOwnerMessage({
      sender: currentOwner.address,
      proxyAddress: wallet.address,
      newOwner: newOwner.address,
      signers,
      codeIds,
    });

    const response = await RequestObiSignAndBroadcastTerraTransactionMsg.send({
      chain: wallet.chainId as TerraChain,
      messages: [message.toAmino()],
      demoMode: wallet.isDemo,
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
      sender: newOwner.address,
      proxyAddress: wallet.address,
    });

    const response = await RequestObiSignAndBroadcastTerraTransactionMsg.send({
      chain: wallet.chainId as TerraChain,
      messages: [message.toAmino()],
      demoMode: wallet.isDemo,
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
  wallet.setOwner(newOwner);
}
