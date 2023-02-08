import {
  RequestObiWalletConnectMsg,
  RequestObiWalletConnectPayload,
  Text,
} from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { Modal } from "react-native";

import { Button } from "../button";
import { useStore } from "../stores";

export const WalletConnectInteractionModal = observer(
  function WalletConnectInteractionModal() {
    const { walletConnectInteractionStore } = useStore();

    const data = walletConnectInteractionStore.waitingData?.data;

    if (!data) return null;

    return <InteractionModalInner data={data} />;
  }
);

const InteractionModalInner = observer(function InteractionModalInner({
  data,
}: {
  data: RequestObiWalletConnectPayload;
}) {
  const { walletConnectInteractionStore } = useStore();

  console.log("INTERACTION", data);

  return (
    <Modal visible>
      <Text>Do you want to connect to {data.peerMeta.name}</Text>
      <Button
        flavor="blue"
        label="Yes"
        onPress={() => {
          walletConnectInteractionStore.approveAndWaitEnd();
        }}
      />
      <Button
        flavor="blue"
        label="No"
        onPress={() => {
          walletConnectInteractionStore.reject();
        }}
      />
    </Modal>
  );
});
