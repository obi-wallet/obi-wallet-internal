import {
  SignAndBroadcastTransactionType,
  useSignAndBroadcastTransaction,
} from "@obi-wallet/headless-ui";
import { SignAndBroadcastTransactionUserInteraction } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
//import * as R from "ramda";

//import { SignatureModalEthereumDemo } from "./ethereum-demo";
import { SignatureModalFlexAccount } from "./flex-account";
import { SignatureModalMultisigKey } from "./multisig-key";
import { SignatureModalSinglesigWallet } from "./singlesig-wallet";
//import { useStore } from "../../../contexts";
import { Alert } from "../../../helpers";

export * from "./confirm-messages";
export * from "./pretty-message";
export * from "./signers";

export interface SignatureModalProps {
  interaction: SignAndBroadcastTransactionUserInteraction;
}

export const SignatureModal = observer<SignatureModalProps>(
  function SignatureModal({ interaction }) {
    // const { configStore } = useStore();

    /*
    const ethereumDemo =
      configStore.config.ethereumBalances &&
      interaction.payload.messages.every((message) => {
        return R.has("eth", message) || R.has("userop", message);
      });

    return ethereumDemo ? (
      <SignatureModalEthereumDemo interaction={interaction} />
    ) : (
      <SignatureModalSdk interaction={interaction} />
    );
    */
    return <SignatureModalSdk interaction={interaction} />;
  },
);

const SignatureModalSdk = observer<SignatureModalProps>(
  function SignatureModalSdk({ interaction }) {
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
  },
);
