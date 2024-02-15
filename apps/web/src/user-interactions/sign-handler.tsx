"use client";

import { useStore } from "@/contexts";
import { TargetChain } from "@/target-chain";
import { isCosmosSdkChainId } from "@/target-chain/cosmos-sdk/chains";
import { ApproveMessages } from "@/user-interactions/approve-messages";
import {
  CosmosSignAminoUserInteraction,
  CosmosSignDirectUserInteraction,
} from "@obi-wallet/wallet-connect";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";

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
  const chainId = interaction.payload.signDoc.chain_id;

  if (!isCosmosSdkChainId(chainId)) {
    console.error("Unsupported chainId: ", chainId);
    return null;
  }

  const targetChain = TargetChain.chainId(chainId);
  const messages = interaction.payload.signDoc.msgs.map((msg) => {
    return targetChain.aminoTypes.fromAmino(msg);
  });

  return (
    <ApproveMessages
      walletMeta={interaction.payload.walletMeta}
      targetChainId={chainId}
      messages={messages}
      rawData={interaction.payload.signDoc.msgs}
      onReject={() => {
        interaction.resolve({
          approved: false,
        });
      }}
      onApprove={async ({ wallet, fee }) => {
        const targetChain = TargetChain.chainId(chainId);
        const signer = await targetChain.getSigner(wallet);
        const signResponse = await signer.signAmino(
          interaction.payload.signerAddress,
          {
            ...interaction.payload.signDoc,
            fee,
          },
        );
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
  const chainId = interaction.payload.signDoc.chainId;

  if (!isCosmosSdkChainId(chainId)) {
    console.error("Unsupported chainId: ", chainId);
    return null;
  }

  // TODO: her we need to decode the signDoc and re-encode it with the correct fees
  return null;
});
