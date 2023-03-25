import { MultisigWallet, SinglesigWallet } from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";

import { AbstractSignatureModalProps } from "./common";
import { ConfirmMessages } from "./confirm-messages";

export interface SignatureModalSinglesigWalletProps
  extends AbstractSignatureModalProps {
  wallet: MultisigWallet;
  singlesigWallet: SinglesigWallet;
}

export const SignatureModalSinglesigWallet =
  observer<SignatureModalSinglesigWalletProps>(function SignatureModalRawKey({
    interaction,
    wallet,
    singlesigWallet,
  }) {
    const { payload } = interaction;

    const broadcast = useMutation({
      mutationFn: async () => {
        return await wallet.signAndBroadcastTransaction({
          singlesigWallet,
          messages: payload.messages,
        });
      },
    });

    return (
      <ConfirmMessages
        loading={broadcast.isLoading}
        cancelable={payload.cancelable}
        messages={payload.messages}
        onCancel={() => {
          interaction.resolve({ approved: false });
        }}
        onConfirm={async () => {
          const response = await broadcast.mutateAsync();
          interaction.resolve({ approved: true, payload: response });
        }}
      />
    );
  });
