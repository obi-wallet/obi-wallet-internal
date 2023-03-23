import { CodeIds, Draft, terra } from "@obi-wallet/common";
import {
  MultisigKey,
  MultisigWallet,
  SignAndBroadcastTransactionUserInteraction,
} from "@obi-wallet/sdk";
import { BlockTxBroadcastResult } from "@terra-money/feather.js";

export async function handleTerra({
  draft,
  wallet,
  codeIds,
}: {
  draft: Draft<MultisigKey>;
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

    const response = await SignAndBroadcastTransactionUserInteraction.start({
      messages: [message],
      demoMode: wallet.isDemo,
      cancelable: true,
      multisigKey: currentOwner,
    });

    try {
      if (response.approved && response.payload.success) {
        terra.parseProposeUpdateOwnerResponse(
          response.payload.rawResult as BlockTxBroadcastResult
        );
      }
    } catch (e) {
      console.log(e);
    }

    await proposeUpdateOwner();
  }

  async function confirmUpdateOwner() {
    const message = terra.getConfirmUpdateOwnerMessage({
      sender: newOwner.address,
      proxyAddress: wallet.address,
    });

    const response = await SignAndBroadcastTransactionUserInteraction.start({
      messages: [message],
      demoMode: wallet.isDemo,
      cancelable: true,
      multisigKey: newOwner,
    });

    try {
      if (response.approved && response.payload.success) {
        terra.parseProposeUpdateOwnerResponse(
          response.payload.rawResult as BlockTxBroadcastResult
        );
        return;
      }
    } catch (e) {
      console.log(e);
    }

    await confirmUpdateOwner();
  }

  await proposeUpdateOwner();
  await confirmUpdateOwner();
  wallet.setOwner(newOwner);
}
