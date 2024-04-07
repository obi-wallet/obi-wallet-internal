"use client";

import { useStore } from "@/contexts";
import { ApproveUpdateOwner } from "@/user-interactions/approve-messages/approve-update-owner";
import { MultisigKey, UpdateOwnerUserInteraction } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";

export const UpdateOwnerUserInteractionHandler = observer<{
  children: ReactNode;
}>(function UpdateOwnerUserInteractionHandler({ children }) {
  const { userInteractionsStore } = useStore();

  const interaction = userInteractionsStore.getPendingUserInteractionsOfType(
    UpdateOwnerUserInteraction,
  )[0];

  if (!interaction) return children;

  return <UpdateOwnerUserInteractionHandlerInner interaction={interaction} />;
});

const UpdateOwnerUserInteractionHandlerInner = observer<{
  interaction: UpdateOwnerUserInteraction;
}>(function UpdateOwnerUserInteractionHandlerInner({ interaction }) {
  return (
    <ApproveUpdateOwner
      walletMeta={interaction.payload.walletMeta}
      previousOwner={MultisigKey.create(
        interaction.payload.homeChainId,
        interaction.payload.previousOwner,
      )}
      nextOwner={MultisigKey.create(
        interaction.payload.homeChainId,
        interaction.payload.nextOwner,
      )}
      onReject={() => {
        interaction.resolve({
          approved: false,
        });
      }}
      onApprove={() => {
        interaction.resolve({
          approved: true,
          payload: {
            success: true,
          },
        });
      }}
    />
  );
});
