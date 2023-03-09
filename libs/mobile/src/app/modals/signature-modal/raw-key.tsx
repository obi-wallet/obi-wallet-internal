import { terra } from "@obi-wallet/common";
import { useMutation } from "@tanstack/react-query";
import { Msg, RawKey } from "@terra-money/terra.js";
import { observer } from "mobx-react-lite";

import { AbstractSignatureModalProps, broadcastTransaction } from "./common";
import { ConfirmMessages } from "./confirm-messages";

export interface SignatureModalRawKeyProps extends AbstractSignatureModalProps {
  rawKey: RawKey;
}

export const SignatureModalRawKey = observer<SignatureModalRawKeyProps>(
  function SignatureModalRawKey({ data, rawKey, onCancel, onConfirm }) {
    const broadcast = useMutation({
      mutationFn: async () => {
        const transaction = await terra.createAndSignSinglesigTransaction({
          key: rawKey,
          chainId: data.chain,
          messages: data.messages.map((data) => {
            return Msg.fromAmino(data);
          }),
        });
        return await broadcastTransaction({
          data,
          transaction,
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
          await onConfirm(response);
        }}
      />
    );
  }
);
