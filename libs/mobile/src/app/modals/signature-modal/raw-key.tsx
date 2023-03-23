import { Chain, Sdk, Signer } from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";

import { AbstractSignatureModalProps } from "./common";
import { ConfirmMessages } from "./confirm-messages";

export interface SignatureModalRawKeyProps extends AbstractSignatureModalProps {
  chainId: Chain;
  signer: Signer;
}

export const SignatureModalRawKey = observer<SignatureModalRawKeyProps>(
  function SignatureModalRawKey({ interaction, chainId, signer }) {
    const { payload } = interaction;
    const broadcast = useMutation({
      mutationFn: async () => {
        const sdk = Sdk.chainId(chainId);
        const signedTransaction = await sdk.createAndSignTransaction({
          signer: signer,
          messages: payload.messages,
        });
        return await sdk.broadcastSignedTransaction({
          signedTransaction,
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
  }
);
