"use client";

import { Button, Text } from "@/components";
import { useStore } from "@/contexts";
import { serialize } from "@obi-wallet/sdk-json";
import { WalletConnectPairingUserInteraction } from "@obi-wallet/wallet-connect";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";

export const WalletConnectPairingUserInteractionHandler = observer<{
  children: ReactNode;
}>(function WalletConnectPairingUserInteractionHandler({ children }) {
  const { userInteractionsStore } = useStore();

  const interaction = userInteractionsStore.getPendingUserInteractionsOfType(
    WalletConnectPairingUserInteraction,
  )[0];

  if (!interaction) return children;

  return (
    <WalletConnectPairingUserInteractionHandlerInner
      interaction={interaction}
    />
  );
});

export const WalletConnectPairingUserInteractionHandlerInner = observer<{
  interaction: WalletConnectPairingUserInteraction;
}>(function WalletConnectPairingUserInteractionHandlerInner({ interaction }) {
  return (
    <div className="w-full">
      <div className="flex justify-center">
        <div className="flex w-fit flex-col items-center">
          <Text
            leading="loose"
            size="3xl"
            fontWeight="bold"
            className="mb-8 mt-4"
          >
            Wallet Connect Session Request
          </Text>

          <div className="mt-6 w-full space-y-3">
            <Text color="gray">Raw Data</Text>
            <pre className="text-gray-400">
              {serialize(interaction.payload, null, 2)}
            </pre>
          </div>

          <div className="mt-6 flex w-full flex-row space-x-6 ">
            <Button
              block
              variant="outline"
              onClick={() => {
                interaction.resolve({
                  approved: false,
                });
              }}
            >
              Reject
            </Button>
            <Button
              block
              onClick={() => {
                interaction.resolve({
                  approved: true,
                });
              }}
            >
              Approve
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});
