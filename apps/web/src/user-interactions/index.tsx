"use client";

import { SetWalletDataUserInteractionHandler } from "@/user-interactions/set-wallet-data";
import { SignAndBroadcastEvmHandler } from "@/user-interactions/sign-and-broadcast/evm";
import { SignAndBroadcastSvmHandler } from "@/user-interactions/sign-and-broadcast/svm/handler";
import { SignAndBroadcastTransactionUserInteractionHandler } from "@/user-interactions/sign-and-broadcast-transaction-handler";
import { SignUserInteractionHandler } from "@/user-interactions/sign-handler";
import { WalletConnectPairingUserInteractionHandler } from "@/user-interactions/wallet-connect-pairing-handler";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";

export const UserInteractionsHandlers = observer(
  function UserInteractionsHandlers({ children }: { children: ReactNode }) {
    return (
      <SignAndBroadcastTransactionUserInteractionHandler>
        <SignAndBroadcastEvmHandler>
          <SignAndBroadcastSvmHandler>
            <WalletConnectPairingUserInteractionHandler>
              <SignUserInteractionHandler>
                <SetWalletDataUserInteractionHandler>
                  {children}
                </SetWalletDataUserInteractionHandler>
              </SignUserInteractionHandler>
            </WalletConnectPairingUserInteractionHandler>
          </SignAndBroadcastSvmHandler>
        </SignAndBroadcastEvmHandler>
      </SignAndBroadcastTransactionUserInteractionHandler>
    );
  },
);
