import { SignAndBroadcastTransactionUserInteraction } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";

import { useStore } from "../../contexts";

const SignatureModal = observer<{
  interaction: SignAndBroadcastTransactionUserInteraction;
}>(function SignatureModal({ interaction }) {
  console.log("rendering SignatureModal", interaction);
  return null;
});

export const SignInteractionModal = observer(function SignInteractionModal() {
  const { userInteractionsStore } = useStore();

  const interaction = userInteractionsStore.getPendingUserInteractionsOfType(
    SignAndBroadcastTransactionUserInteraction
  )[0];

  if (!interaction) return null;

  console.log(
    JSON.stringify(
      interaction.payload.messages.map((m) => m.toAmino()),
      null,
      2
    )
  );

  return <SignatureModal interaction={interaction} />;
});
