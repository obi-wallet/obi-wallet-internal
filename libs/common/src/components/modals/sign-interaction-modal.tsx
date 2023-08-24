import { SignAndBroadcastTransactionUserInteraction } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";

import { SignatureModal } from "./signature-modal";
import { useStore } from "../../contexts";

export const SignInteractionModal = observer(function SignInteractionModal() {
  const { userInteractionsStore } = useStore();

  const interaction = userInteractionsStore.getPendingUserInteractionsOfType(
    SignAndBroadcastTransactionUserInteraction,
  )[0];

  if (!interaction) return null;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore TODO: fix this
  return <SignatureModal interaction={interaction} />;
});
