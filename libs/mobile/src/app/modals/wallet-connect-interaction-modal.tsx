import { RequestObiWalletConnectPayload, Text } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { Modal, SafeAreaView, View } from "react-native";

import { Button } from "../button";
import { OnboardingScreenContainer } from "../screens/components/onboarding-screen-container";
import Wc from "../screens/dapp-explorer/assets/wallet-connect.svg";
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

  return (
    <Modal visible={true}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#1a1a1a" }}>
        <View style={{ paddingHorizontal: 20, flex: 1 }}>
          <Text
            style={{
              textAlign: "center",
              color: "white",
              fontWeight: "600",
              fontSize: 18,
            }}
          >
            Wallet Connect
          </Text>
          <View style={{ flex: 1 }}>
            <View
              style={{
                maxHeight: 150,
                paddingVertical: 50,
              }}
            >
              <Wc />
            </View>
            <Text style={{ color: "#fff", textAlign: "center" }}>
              {data.peerMeta.name} requested to connect your wallet
            </Text>
            <View
              style={{
                backgroundColor: "#272727",
                marginVertical: 20,
                borderRadius: 7,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  padding: 10,
                }}
              >
                URL:{"  "}
                <Text
                  style={{
                    opacity: 0.5,
                    fontSize: 12,
                  }}
                >
                  {data.peerMeta.url}
                </Text>
              </Text>
            </View>
            <View
              style={{
                backgroundColor: "#272727",
                padding: 10,
                borderRadius: 7,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                }}
              >
                Description:
              </Text>
              <Text
                style={{
                  color: "#fff",
                  opacity: 0.5,
                }}
              >
                {data.peerMeta.description}
              </Text>
            </View>
          </View>
          <View>
            <Button
              flavor="blue"
              label="Allow"
              onPress={() => {
                walletConnectInteractionStore.approveAndWaitEnd();
              }}
            />
            <Button
              flavor="cancel"
              label="Deny"
              onPress={() => {
                walletConnectInteractionStore.reject();
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
});
