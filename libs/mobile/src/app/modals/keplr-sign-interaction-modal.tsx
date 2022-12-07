import { coins } from "@cosmjs/amino";
import { SignDocWrapper } from "@keplr-wallet/cosmos";
import { observer } from "mobx-react-lite";

import { useStore } from "../stores";
import { ConfirmMessages } from "./signature-modal/confirm-messages";

export const KeplrSignInteractionModal = observer(() => {
  const { chainStore, keplrSignInteractionStore } = useStore();

  const signDocWrapper =
    keplrSignInteractionStore.waitingData?.data.signDocWrapper;

  if (!signDocWrapper) return null;

  return (
    <ConfirmMessages
      innerMessages={signDocWrapper.aminoSignDoc.msgs}
      messages={signDocWrapper.aminoSignDoc.msgs}
      onConfirm={async () => {
        // TODO: simulate fees
        const newSignDoc = {
          ...signDocWrapper.aminoSignDoc,
          fee: {
            amount: coins(6000, chainStore.currentChainInformation.denom),
            gas: "1280000",
          },
        };

        try {
          await keplrSignInteractionStore.approveAndWaitEnd(
            SignDocWrapper.fromAminoSignDoc(newSignDoc)
          );
        } catch (error) {
          console.log(error);
        }
      }}
      onCancel={() => {
        keplrSignInteractionStore.rejectAll();
      }}
    />
  );
});
