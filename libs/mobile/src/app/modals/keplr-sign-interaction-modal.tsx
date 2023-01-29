import { coins } from "@cosmjs/amino";
import { SignDocWrapper } from "@keplr-wallet/cosmos";
import { observer } from "mobx-react-lite";

import { ConfirmMessages } from "./signature-modal/confirm-messages";
import { useStore } from "../stores";

export const KeplrSignInteractionModal = observer(
  function KeplrSignInteractionModal() {
    const { chainStore, keplrSignInteractionStore } = useStore();

    const signDocWrapper =
      keplrSignInteractionStore.waitingData?.data.signDocWrapper;

    if (!signDocWrapper) return null;

    return (
      <ConfirmMessages
        messages={signDocWrapper.aminoSignDoc.msgs}
        onConfirm={async () => {
          // TODO: simulate fees
          const newSignDoc = {
            ...signDocWrapper.aminoSignDoc,
            fee: {
              amount: coins(
                6000,
                chainStore.currentCosmosChainInformation.denom
              ),
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
  }
);
