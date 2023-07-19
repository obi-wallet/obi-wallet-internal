import { SignatureModal, useStore } from "@obi-wallet/common";
import { SignAndBroadcastTransactionUserInteraction } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import * as R from "ramda";

export const SignInteractionModal = observer(function SignInteractionModal() {
  const { userInteractionsStore } = useStore();

  const interaction = userInteractionsStore.getPendingUserInteractionsOfType(
    SignAndBroadcastTransactionUserInteraction,
  )[0];

  if (!interaction) return null;

  console.log(
    JSON.stringify(
      interaction.payload.messages.map((m) => {
        R.has("osmo", m) ? m.osmo : m.toAmino();
      }),
      null,
      2,
    ),
  );

  return <SignatureModal interaction={interaction} />;
});
