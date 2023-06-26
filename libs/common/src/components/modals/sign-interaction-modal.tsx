import { SignAndBroadcastTransactionUserInteraction } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import * as R from "ramda";

import { SignatureModal } from "./signature-modal";
import { useStore } from "../../contexts";

export const SignInteractionModal = observer(function SignInteractionModal() {
  const { userInteractionsStore } = useStore();

  const interaction = userInteractionsStore.getPendingUserInteractionsOfType(
    SignAndBroadcastTransactionUserInteraction
  )[0];

  if (!interaction) return null;

  console.log(
    JSON.stringify(
      interaction.payload.messages.map((m) => {
        if (R.has("eth", m)) {
          return m.eth;
        }
        if (R.has("osmo", m)) {
          return m.osmo;
        }
        return m.toAmino();
      }),
      null,
      2
    )
  );

  return <SignatureModal interaction={interaction} />;
});
