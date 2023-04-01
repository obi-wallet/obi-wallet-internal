import { Draft, terra } from "@obi-wallet/common";
import {
  CodeIds,
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

    try {
      const response = await SignAndBroadcastTransactionUserInteraction.start({
        messages: [message],
        demoMode: wallet.isDemo,
        cancelable: true,
        multisigKey: currentOwner,
      });
      if (response.approved === false) return;

      if (response.payload.success) {
        terra.parseProposeUpdateOwnerResponse(
          response.payload.rawResult as BlockTxBroadcastResult
        );
      } else {
        throw new Error("Transaction failed");
      }
    } catch (e) {
      console.error(e);
      await proposeUpdateOwner();
    }
  }

  async function confirmUpdateOwner() {
    const message = terra.getConfirmUpdateOwnerMessage({
      sender: newOwner.address,
      proxyAddress: wallet.address,
    });

    try {
      const response = await SignAndBroadcastTransactionUserInteraction.start({
        messages: [message],
        demoMode: wallet.isDemo,
        cancelable: true,
        multisigKey: newOwner,
      });
      if (response.approved === false) return;

      if (response.payload.success) {
        terra.parseProposeUpdateOwnerResponse(
          response.payload.rawResult as BlockTxBroadcastResult
        );
        return;
      } else {
        throw new Error("Transaction failed");
      }
    } catch (e) {
      console.error(e);
      await confirmUpdateOwner();
    }
  }

  await proposeUpdateOwner();
  await confirmUpdateOwner();
  wallet.setOwner(newOwner);
}
