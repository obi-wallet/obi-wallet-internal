import { RequestObiCosmosSignAndBroadcastPayload } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";

import { useStore } from "../stores";

export const SignInteractionModal = observer(function SignInteractionModal() {
  const { signInteractionStore } = useStore();

  const data = signInteractionStore.waitingData?.data;

  if (!data) return null;

  return <InteractionModalInner data={data} />;
});

const InteractionModalInner = observer(function InteractionModalInner(_: {
  data: RequestObiCosmosSignAndBroadcastPayload;
}) {
  return null;
});
