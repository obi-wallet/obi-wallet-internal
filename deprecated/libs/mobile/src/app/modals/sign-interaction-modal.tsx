import { SignatureModal, useStore } from "@obi-wallet/common";
import { SignAndBroadcastTransactionUserInteraction } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";

export const SignInteractionModal = observer(function SignInteractionModal() {
  const { userInteractionsStore } = useStore();

  const interaction = userInteractionsStore.getPendingUserInteractionsOfType(
    SignAndBroadcastTransactionUserInteraction,
  )[0];

  if (!interaction) return null;

  return <SignatureModal interaction={interaction} />;
});
