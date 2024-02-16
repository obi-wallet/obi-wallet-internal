import { SignAndBroadcastTransactionUserInteractionHandler } from "@/user-interactions/sign-and-broadcast-transaction-handler";
import { SignUserInteractionHandler } from "@/user-interactions/sign-handler";
import { WalletConnectPairingUserInteractionHandler } from "@/user-interactions/wallet-connect-pairing-handler";
import { ReactNode } from "react";

export function UserInteractionsHandlers({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SignAndBroadcastTransactionUserInteractionHandler>
      <WalletConnectPairingUserInteractionHandler>
        <SignUserInteractionHandler>{children}</SignUserInteractionHandler>
      </WalletConnectPairingUserInteractionHandler>
    </SignAndBroadcastTransactionUserInteractionHandler>
  );
}
