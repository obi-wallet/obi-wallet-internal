"use client";

import { useStore } from "@/contexts";
import { RecoverWallet } from "@/user-interactions/approve-messages/recover-wallet";
import { MultisigKey, RecoverWalletUserInteraction } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";

export const RecoverWalletUserInteractionHandler = observer<{
  children: ReactNode;
}>(function RecoverWalletUserInteractionHandler({ children }) {
  const { userInteractionsStore } = useStore();

  const interaction = userInteractionsStore.getPendingUserInteractionsOfType(
    RecoverWalletUserInteraction,
  )[0];

  if (!interaction) return children;

  return <RecoverWalletUserInteractionHandlerInner interaction={interaction} />;
});

const RecoverWalletUserInteractionHandlerInner = observer<{
  interaction: RecoverWalletUserInteraction;
}>(function RecoverWalletUserInteractionHandlerInner({ interaction }) {
  return (
    <RecoverWallet
      owner={MultisigKey.create(
        interaction.payload.homeChainId,
        interaction.payload.owner,
      )}
      walletData={interaction.payload.walletData}
      keyMetaData={interaction.payload.keyMetaData}
      onReject={() => {
        interaction.resolve({
          approved: false,
        });
      }}
      onApprove={() => {
        interaction.resolve({
          approved: true,
        });
      }}
    />
  );
});
