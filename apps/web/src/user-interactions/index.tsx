import { RecoverWalletUserInteractionHandler } from "@/user-interactions/recover-wallet-handler";
import { SignAndBroadcastTransactionUserInteractionHandler } from "@/user-interactions/sign-and-broadcast-transaction-handler";
import { SignUserInteractionHandler } from "@/user-interactions/sign-handler";
import { UpdateOwnerUserInteractionHandler } from "@/user-interactions/update-owner-handler";
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
        <SignUserInteractionHandler>
          <UpdateOwnerUserInteractionHandler>
            <RecoverWalletUserInteractionHandler>
              {children}
            </RecoverWalletUserInteractionHandler>
          </UpdateOwnerUserInteractionHandler>
        </SignUserInteractionHandler>
      </WalletConnectPairingUserInteractionHandler>
    </SignAndBroadcastTransactionUserInteractionHandler>
  );
}
