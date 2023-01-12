import { RequestObiTerraSignAndBroadcastPayload } from "@obi-wallet/common";
import { BlockTxBroadcastResult } from "@terra-money/terra.js";
import { observer } from "mobx-react-lite";

import { useStore } from "../stores";
import {
  TerraSignatureModal,
  useTerraSignatureModalProps,
} from "./terra-signature-modal";

export const TerraSignInteractionModal = observer(() => {
  const { terraSignInteractionStore } = useStore();

  const data = terraSignInteractionStore.waitingData?.data;

  if (!data) return null;

  return <InteractionModalInner data={data} />;
});

const InteractionModalInner = observer(
  ({ data }: { data: RequestObiTerraSignAndBroadcastPayload }) => {
    const { terraSignInteractionStore } = useStore();

    const { signatureModalProps } = useTerraSignatureModalProps({
      data,
      async onConfirm(response: BlockTxBroadcastResult): Promise<void> {
        await terraSignInteractionStore.approveAndWaitEnd(response);
      },
    });

    return (
      <TerraSignatureModal
        {...signatureModalProps}
        visible
        onCancel={() => {
          terraSignInteractionStore.rejectAll();
        }}
      />
    );
  }
);
