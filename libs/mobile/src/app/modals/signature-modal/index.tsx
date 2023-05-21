import {
  SignAndBroadcastTransactionType,
  useSignAndBroadcastTransaction,
} from "@obi-wallet/headless-ui";
import { SignAndBroadcastTransactionUserInteraction } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { Alert } from "react-native";

import { SignatureModalFlexAccount } from "./flex-account";
import { SignatureModalMultisigKey } from "./multisig-key";
import { SignatureModalSinglesigWallet } from "./singlesig-wallet";

export interface SignatureModalProps {
  interaction: SignAndBroadcastTransactionUserInteraction;
}

export const SignatureModal = observer<SignatureModalProps>(
  function SignatureModal({ interaction }) {
    const payload = useSignAndBroadcastTransaction({
      interaction,
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

    if (!payload) return null;
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
