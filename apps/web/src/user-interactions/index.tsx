import { SetWalletDataUserInteractionHandler } from "@/user-interactions/set-wallet-data";
import { SignAndBroadcastEvmHandler } from "@/user-interactions/sign-and-broadcast/evm";
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
      <SignAndBroadcastEvmHandler>
        <WalletConnectPairingUserInteractionHandler>
          <SignUserInteractionHandler>
            <SetWalletDataUserInteractionHandler>
              {children}
            </SetWalletDataUserInteractionHandler>
          </SignUserInteractionHandler>
        </WalletConnectPairingUserInteractionHandler>
      </SignAndBroadcastEvmHandler>
    </SignAndBroadcastTransactionUserInteractionHandler>
  );
}
