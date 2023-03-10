import { RequestObiSignAndBroadcastTerraTransactionPayload } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";

import { SignatureModal } from "./signature-modal";
import { useStore } from "../stores";

export const TerraSignInteractionModal = observer(
  function TerraSignInteractionModal() {
    const { terraSignInteractionStore } = useStore();

    const data = terraSignInteractionStore.waitingData?.data;

    if (!data) return null;

    return <InteractionModalInner data={data} />;
  }
);

const InteractionModalInner = observer(function InteractionModalInner({
  data,
}: {
  data: RequestObiSignAndBroadcastTerraTransactionPayload;
}) {
  const { terraSignInteractionStore } = useStore();

  console.log(JSON.stringify(data.messages, null, 2));

  return (
    <SignatureModal
      data={data}
      onConfirm={async (response) => {
        await terraSignInteractionStore.approveAndWaitEnd(response);
      }}
      onCancel={async () => {
        await terraSignInteractionStore.rejectAll();
      }}
    />
  );
});
