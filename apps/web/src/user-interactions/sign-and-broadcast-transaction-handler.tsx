"use client";

import { useStore } from "@/contexts";
import { TargetChain } from "@/target-chain";
import { isCosmosSdkChainId } from "@/target-chain/cosmos-sdk/chains";
import { ApproveMessages } from "@/user-interactions/approve-messages";
import { isDeliverTxSuccess } from "@cosmjs/stargate";
import { NewSignAndBroadcastTransactionUserInteraction } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";

export const SignAndBroadcastTransactionUserInteractionHandler = observer<{
  children: ReactNode;
}>(function SignAndBroadcastTransactionUserInteractionHandler({ children }) {
  const { userInteractionsStore } = useStore();

  const interaction = userInteractionsStore.getPendingUserInteractionsOfType(
    NewSignAndBroadcastTransactionUserInteraction,
  )[0];

  if (!interaction) return children;

  return (
    <SignAndBroadcastTransactionUserInteractionHandlerInner
      interaction={interaction}
    />
  );
});

export const SignAndBroadcastTransactionUserInteractionHandlerInner = observer<{
  interaction: NewSignAndBroadcastTransactionUserInteraction;
}>(function SignAndBroadcastTransactionUserInteractionHandlerInner({
  interaction,
}) {
  const chainId = interaction.payload.targetChainId;

  if (!isCosmosSdkChainId(chainId)) {
    console.error("Unsupported chainId: ", chainId);
    return null;
  }

  return (
    <ApproveMessages
      walletMeta={interaction.payload.walletMeta}
      targetChainId={chainId}
      messages={interaction.payload.messages}
      rawData={interaction.payload.messages}
      onReject={() => {
        interaction.resolve({
          approved: false,
        });
      }}
      onApprove={async ({ wallet, fee }) => {
        const response = await TargetChain.chainId(chainId).signAndBroadcast({
          wallet,
          fee,
          messages: interaction.payload.messages,
        });
        interaction.resolve({
          approved: true,
          payload: {
            success: isDeliverTxSuccess(response),
            rawLog: response.rawLog,
            transactionHash: response.transactionHash,
            rawResult: response,
          },
        });
      }}
    />
  );
});
