import { useTheme } from "@emotion/react";
import {
  SignAndBroadcastTransactionType,
  useSignAndBroadcastTransaction,
} from "@obi-wallet/headless-ui";
import {
  SignAndBroadcastTransactionUserInteraction,
  Token,
} from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import { MsgSend } from "@terra-money/feather.js";
import { observer } from "mobx-react-lite";

import { ConfirmMessages } from "./confirm-messages";
import { SignatureModalFlexAccount } from "./flex-account";
import { SignatureModalMultisigKey } from "./multisig-key";
import { SignatureModalSinglesigWallet } from "./singlesig-wallet";
import { useStore } from "../../../contexts";
import { Alert } from "../../../helpers";

export * from "./confirm-messages";
export * from "./pretty-message";
export * from "./signers";

export interface SignatureModalProps {
  interaction: SignAndBroadcastTransactionUserInteraction;
}

export const SignatureModal = observer<SignatureModalProps>(
  function SignatureModal({ interaction }) {
    const theme = useTheme();
    const { sdkRootStore } = useStore();
    const payload = useSignAndBroadcastTransaction({
      interaction: theme.ethereumBalances
        ? {
            ...interaction,
            payload: {
              ...interaction.payload,
              messages: [],
            },
          }
        : interaction,
      onError(error) {
        Alert.alert("Transaction failed", error.message, [
          {
            text: "Cancel",
            onPress: () => {
              interaction.resolve({ approved: false });
            },
          },
        ]);
      },
    });
    const ethereumBroadcast = useMutation({
      mutationFn: async () => {
        const message = interaction.payload.messages[0] as unknown as {
          eth: { to: string; token: Token };
        };
        const account =
          await sdkRootStore.ethereumDemoStore.getEthereumAccount();
        const response = await fetch("/api/ethereum-demo/send", {
          method: "POST",
          body: JSON.stringify({
            account,
            to: message.eth.to,
            token: message.eth.token,
          }),
        });
        const event = await response.json();
        return {
          success: !!event.transactionHash,
          transactionHash: event.transactionHash,
          rawResult: JSON.stringify(event),
        };
      },
      onSuccess(payload) {
        interaction.resolve({
          approved: true,
          payload,
        });
      },
      retry: 2,
    });

    if (!payload) return null;

    if (theme.ethereumBalances) {
      const message = interaction.payload.messages[0] as unknown as {
        eth: { to: string; token: Token };
      };
      const messages = [
        new MsgSend("from", message.eth.to, {
          [message.eth.token.id]: message.eth.token.rawAmount,
        }),
      ];

      return (
        <ConfirmMessages
          loading={ethereumBroadcast.isLoading}
          cancelable={interaction.payload.cancelable}
          messages={messages}
          chainId="osmo-test-5"
          onCancel={payload.cancel}
          onConfirm={ethereumBroadcast.mutateAsync}
        />
      );
    }

    switch (payload.type) {
      case SignAndBroadcastTransactionType.FlexAccount:
        return <SignatureModalFlexAccount {...payload} />;
      case SignAndBroadcastTransactionType.SinglesigWallet:
        return <SignatureModalSinglesigWallet {...payload} />;
      case SignAndBroadcastTransactionType.MultisigKey:
        return <SignatureModalMultisigKey {...payload} />;
    }
  }
);
