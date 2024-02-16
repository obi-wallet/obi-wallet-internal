"use client";

import { useStore } from "@/contexts";
import {
  CosmosSignAminoUserInteraction,
  CosmosSignDirectUserInteraction,
} from "@obi-wallet/wallet-connect";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";

import {
  ApproveMessagesSignDoc,
  ApproveMessagesStdSignDoc,
} from "./approve-messages";

export const SignUserInteractionHandler = observer<{
  children: ReactNode;
}>(function SignUserInteractionHandler({ children }) {
  return (
    <CosmosSignAminoSignUserInteractionHandler>
      <CosmosSignDirectUserInteractionHandler>
        {children}
      </CosmosSignDirectUserInteractionHandler>
    </CosmosSignAminoSignUserInteractionHandler>
  );
});

const CosmosSignAminoSignUserInteractionHandler = observer<{
  children: ReactNode;
}>(function CosmosSignAminoSignUserInteractionHandler({ children }) {
  const { userInteractionsStore } = useStore();

  const interaction = userInteractionsStore.getPendingUserInteractionsOfType(
    CosmosSignAminoUserInteraction,
  )[0];

  if (!interaction) return children;

  return (
    <CosmosSignAminoSignUserInteractionHandlerInner interaction={interaction} />
  );
});

const CosmosSignAminoSignUserInteractionHandlerInner = observer<{
  interaction: CosmosSignAminoUserInteraction;
}>(function CosmosSignAminoSignUserInteractionHandlerInner({ interaction }) {
  return (
    <ApproveMessagesStdSignDoc
      walletMeta={interaction.payload.walletMeta}
      signerAddress={interaction.payload.signerAddress}
      signDoc={interaction.payload.signDoc}
      onReject={() => {
        interaction.resolve({
          approved: false,
        });
      }}
      onApprove={async (signResponse) => {
        interaction.resolve({
          approved: true,
          payload: signResponse,
        });
      }}
    />
  );
});

const CosmosSignDirectUserInteractionHandler = observer<{
  children: ReactNode;
}>(function CosmosSignDirectUserInteractionHandler({ children }) {
  const { userInteractionsStore } = useStore();

  const interaction = userInteractionsStore.getPendingUserInteractionsOfType(
    CosmosSignDirectUserInteraction,
  )[0];

  if (!interaction) return children;

  return (
    <CosmosSignDirectUserInteractionHandlerInner interaction={interaction} />
  );
});

const CosmosSignDirectUserInteractionHandlerInner = observer<{
  interaction: CosmosSignDirectUserInteraction;
}>(function CosmosSignDirectUserInteractionHandlerInner({ interaction }) {
  return (
    <ApproveMessagesSignDoc
      walletMeta={interaction.payload.walletMeta}
      signerAddress={interaction.payload.signerAddress}
      signDoc={interaction.payload.signDoc}
      onReject={() => {
        interaction.resolve({
          approved: false,
        });
      }}
      onApprove={async (signResponse) => {
        interaction.resolve({
          approved: true,
          payload: signResponse,
        });
      }}
    />
  );
});
