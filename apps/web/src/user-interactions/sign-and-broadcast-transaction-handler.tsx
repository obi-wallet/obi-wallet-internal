"use client";

import { useStore } from "@/contexts";
import { TargetChain } from "@/target-chain";
import { isCosmosChainId } from "@/target-chain/cosmos/chains";
import {
  ApproveMessages,
  ApproveMessagesProps,
} from "@/user-interactions/approve-messages";
import { isDeliverTxSuccess } from "@cosmjs/stargate";
import { SignAndBroadcastTransactionUserInteraction } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import invariant from "tiny-invariant";

export const SignAndBroadcastTransactionUserInteractionHandler = observer<{
  children: ReactNode;
}>(function SignAndBroadcastTransactionUserInteractionHandler({ children }) {
  const { userInteractionsStore } = useStore();

  const interaction = userInteractionsStore.getPendingUserInteractionsOfType(
    SignAndBroadcastTransactionUserInteraction,
  )[0];

  if (!interaction) return children;

  return (
    <SignAndBroadcastTransactionUserInteractionHandlerInner
      interaction={interaction}
    />
  );
});

export const SignAndBroadcastTransactionUserInteractionHandlerInner = observer<{
  interaction: SignAndBroadcastTransactionUserInteraction;
}>(function SignAndBroadcastTransactionUserInteractionHandlerInner({
  interaction,
}) {
  const chainId = interaction.payload.targetChainId;

  if (!isCosmosChainId(chainId)) {
    console.error("Unsupported chainId: ", chainId);
    return null;
  }

  const props =
    signAndBroadcastTransactionUserInteractionToApproveMessagesProps(
      interaction,
    );
  return <ApproveMessages {...props} />;
});

export function signAndBroadcastTransactionUserInteractionToApproveMessagesProps(
  interaction: SignAndBroadcastTransactionUserInteraction,
): ApproveMessagesProps {
  const chainId = interaction.payload.targetChainId;

  invariant(isCosmosChainId(chainId), "Invalid chainId");

  return {
    walletMeta: interaction.payload.walletMeta,
    targetChainId: chainId,
    messages: interaction.payload.messages,
    memo: interaction.payload.memo,
    rawData: interaction.payload.messages,
    onApprove: async ({
      wallet,
      fee,
      intentionsPayload,
      intentionsResults,
    }) => {
      const targetChain = TargetChain.chainId(chainId);
      const payload = {
        wallet,
        messages: interaction.payload.messages,
        fee,
        memo: interaction.payload.memo,
        intentionsPayload,
        intentionsResults,
      };

      if (interaction.payload.mockOnly) {
        const response = await targetChain.sign(payload);
        console.log(response);
        return;
      }

      const response = await targetChain.signAndBroadcast(payload);
      interaction.resolve({
        approved: true,
        payload: {
          success: isDeliverTxSuccess(response),
          rawLog: response.rawLog,
          transactionHash: response.transactionHash,
          rawResult: response,
        },
      });
    },
    onReject: () => {
      interaction.resolve({
        approved: false,
      });
    },
  };
}
