"use client";

import { useStore } from "@/contexts";
import { TargetChain } from "@/target-chain";
import { ApproveSvmTransaction } from "@/user-interactions/sign-and-broadcast/svm/approve-svm-transaction";
import { Encoding } from "@obi-wallet/encoding";
import {
  Keypair,
  Message,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";

import { SignAndBroadcastSvm } from "./user-interaction";

export interface SignAndBroadcastSvmHandlerProps {
  children: ReactNode;
}

export const SignAndBroadcastSvmHandler =
  observer<SignAndBroadcastSvmHandlerProps>(
    function SignAndBroadcastSvmHandler({ children }) {
      const { userInteractionsStore } = useStore();

      const interaction =
        userInteractionsStore.getPendingUserInteractionsOfType(
          SignAndBroadcastSvm,
        )[0];

      if (!interaction) return children;

      return <SignAndBroadcastSvmHandlerInner interaction={interaction} />;
    },
  );

export const SignAndBroadcastSvmHandlerInner = observer<{
  interaction: SignAndBroadcastSvm;
}>(function SignAndBroadcastSvmHandlerInner({ interaction }) {
  return (
    <ApproveSvmTransaction
      walletMeta={interaction.payload.walletMeta}
      targetChainId={interaction.payload.targetChainId}
      message={interaction.payload.message}
      onReject={() => {
        interaction.resolve({
          approved: false,
        });
      }}
      onApprove={async ({ keyPair, transaction }) => {
        console.log(keyPair);
        const kp = Keypair.fromSecretKey(
          Encoding.concat(
            Encoding.fromBase58(keyPair.privateKey),
            Encoding.fromBase58(keyPair.publicKey.value),
          ).toBytes(),
        );
        const targetChain = TargetChain.chainId(
          interaction.payload.targetChainId,
        );
        const tx = Transaction.populate(Message.from(transaction.message), [
          kp.publicKey.toString(),
        ]);

        if (interaction.payload.mockOnly) {
          tx.sign(kp);
          console.log(tx.serialize());
          return;
        }

        await sendAndConfirmTransaction(targetChain.solanaConnection, tx, [kp]);
        interaction.resolve({
          approved: true,
        });
      }}
    />
  );
});
