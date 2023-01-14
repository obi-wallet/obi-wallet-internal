import { DeliverTxResponse } from "@cosmjs/stargate";
import { RequestObiCosmosSignAndBroadcastPayload } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";

import { useStore } from "../stores";
import {
  CosmosSignatureModal,
  useSignatureModalProps,
} from "./signature-modal";

export const SignInteractionModal = observer(() => {
  const { signInteractionStore } = useStore();

  const data = signInteractionStore.waitingData?.data;

  if (!data) return null;

  return <InteractionModalInner data={data} />;
});

const InteractionModalInner = observer(
  ({ data }: { data: RequestObiCosmosSignAndBroadcastPayload }) => {
    const { signInteractionStore } = useStore();

    const { signatureModalProps } = useSignatureModalProps({
      data,
      async onConfirm(response: DeliverTxResponse): Promise<void> {
        await signInteractionStore.approveAndWaitEnd(response);
      },
    });

    return (
      <CosmosSignatureModal
        {...signatureModalProps}
        visible
        onCancel={() => {
          signInteractionStore.rejectAll();
        }}
      />
    );
  }
);
