"use client";

import { useStore } from "@/contexts";
import { TargetChain } from "@/target-chain";
import { deserializeUserOperation } from "@/target-chain/evm";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";

import { ApproveEvmTransaction } from "./approve-evm-transaction";
import { SignAndBroadcastEvm } from "./user-interaction";

export interface SignAndBroadcastEvmHandlerProps {
  children: ReactNode;
}

export const SignAndBroadcastEvmHandler =
  observer<SignAndBroadcastEvmHandlerProps>(
    function SignAndBroadcastEvmHandler({ children }) {
      const { userInteractionsStore } = useStore();

      const interaction =
        userInteractionsStore.getPendingUserInteractionsOfType(
          SignAndBroadcastEvm,
        )[0];

      if (!interaction) return children;

      return <SignAndBroadcastEvmHandlerInner interaction={interaction} />;
    },
  );

export const SignAndBroadcastEvmHandlerInner = observer<{
  interaction: SignAndBroadcastEvm;
}>(function SignAndBroadcastEvmHandlerInner({ interaction }) {
  return (
    <ApproveEvmTransaction
      walletMeta={interaction.payload.walletMeta}
      targetChainId={interaction.payload.targetChainId}
      callData={interaction.payload.callData}
      onReject={() => {
        interaction.resolve({
          approved: false,
        });
      }}
      onApprove={async ({
        wallet,
        userOperation,
        intentionsPayload,
        intentionsResults,
      }) => {
        const targetChain = TargetChain.chainId(
          interaction.payload.targetChainId,
        );
        const payload = {
          wallet,
          userOperation: deserializeUserOperation(userOperation),
          intentionsPayload,
          intentionsResults,
        };

        if (interaction.payload.mockOnly) {
          const response = await targetChain.sign(payload);
          console.log(response);
          return;
        }

        const hash = await targetChain.signAndBroadcast(payload);
        interaction.resolve({
          approved: true,
          hash,
        });
      }}
    />
  );
});
