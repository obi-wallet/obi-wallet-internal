import {
  SignAndBroadcastTransactionType,
  useSignAndBroadcastTransaction,
} from "@obi-wallet/headless-ui";
import { observer } from "mobx-react-lite";

import { ConfirmMessages } from "./confirm-messages";

export type SignatureModalSinglesigWalletProps = ReturnType<
  typeof useSignAndBroadcastTransaction
> & {
  type: SignAndBroadcastTransactionType.SinglesigWallet;
};

export const SignatureModalSinglesigWallet =
  observer<SignatureModalSinglesigWalletProps>(
    function SignatureModalSinglesigWallet({
      interaction,
      messages,
      wallet,
      cancel,
      broadcast,
    }) {
      return (
        <ConfirmMessages
          loading={broadcast.isLoading}
          cancelable={interaction.payload.cancelable}
          messages={messages}
          chainId={wallet.chainId}
          onCancel={cancel}
          onConfirm={broadcast.mutateAsync}
        />
      );
    },
  );
