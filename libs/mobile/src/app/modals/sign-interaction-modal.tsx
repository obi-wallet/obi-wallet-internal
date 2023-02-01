import { DeliverTxResponse } from "@cosmjs/stargate";
import { RequestObiCosmosSignAndBroadcastPayload } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";

import {
  CosmosSignatureModal,
  useSignatureModalProps,
} from "./signature-modal";
import { useStore } from "../stores";

export const SignInteractionModal = observer(function SignInteractionModal() {
  const { signInteractionStore } = useStore();

  const data = signInteractionStore.waitingData?.data;

  if (!data) return null;

  return <InteractionModalInner data={data} />;
});

const InteractionModalInner = observer(function InteractionModalInner({
  data,
}: {
  data: RequestObiCosmosSignAndBroadcastPayload;
}) {
  const { signInteractionStore } = useStore();
  // TODO:
  return null;

  // const { signatureModalProps } = useSignatureModalProps({
  //   data,
  //   async onConfirm(response: DeliverTxResponse): Promise<void> {
  //     await signInteractionStore.approveAndWaitEnd(response);
  //   },
  // });
  //
  // return (
  //   <CosmosSignatureModal
  //     {...signatureModalProps}
  //     visible
  //     onCancel={() => {
  //       signInteractionStore.rejectAll();
  //     }}
  //   />
  // );
});
