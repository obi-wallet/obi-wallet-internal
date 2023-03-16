import { Sdk, Signer } from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import { BlockTxBroadcastResult, Msg } from "@terra-money/feather.js";
import { observer } from "mobx-react-lite";

import { AbstractSignatureModalProps } from "./common";
import { ConfirmMessages } from "./confirm-messages";

export interface SignatureModalRawKeyProps extends AbstractSignatureModalProps {
  signer: Signer;
}

export const SignatureModalRawKey = observer<SignatureModalRawKeyProps>(
  function SignatureModalRawKey({ data, signer, onCancel, onConfirm }) {
    const broadcast = useMutation({
      mutationFn: async () => {
        const sdk = Sdk.chainId(data.chain);
        const signedTransaction = await sdk.createAndSignTransaction({
          signer: signer,
          messages: data.messages.map((data) => {
            return Msg.fromAmino(data);
          }),
        });
        return await sdk.broadcastSignedTransaction({
          signedTransaction,
        });
      },
    });

    return (
      <ConfirmMessages
        loading={broadcast.isLoading}
        cancelable={data.cancelable}
        messages={data.messages}
        onCancel={onCancel}
        onConfirm={async () => {
          const response = await broadcast.mutateAsync();
          await onConfirm(response.rawResult as BlockTxBroadcastResult);
        }}
      />
    );
  }
);
