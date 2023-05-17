import { Button, Text, useStore } from "@obi-wallet/common";
import { InitiateWalletConnectSessionUserInteraction } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { View } from "react-native";

import { Modal } from "../../components/modal";
import { ScreenContainer } from "../screens/components/screen-container";
import Wc from "../screens/dapp-explorer/assets/wallet-connect.svg";

export const WalletConnectInteractionModal = observer(
  function WalletConnectInteractionModal() {
    const { userInteractionsStore } = useStore();

    const interaction = userInteractionsStore.getPendingUserInteractionsOfType(
      InitiateWalletConnectSessionUserInteraction
    )[0];

    if (!interaction) return null;

    return <InteractionModalInner interaction={interaction} />;
  }
);

const InteractionModalInner = observer(function InteractionModalInner({
  interaction,
}: {
  interaction: InitiateWalletConnectSessionUserInteraction;
}) {
  return (
    <Modal visible>
      <ScreenContainer>
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
            {interaction.payload.peerMeta.name} requested to connect your wallet
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
                {interaction.payload.peerMeta.url}
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
              {interaction.payload.peerMeta.description}
            </Text>
          </View>
        </View>
        <View>
          <Button
            flavor="blue"
            label="Allow"
            onPress={() => {
              interaction.resolve({ approved: true });
            }}
          />
          <Button
            flavor="cancel"
            label="Deny"
            onPress={() => {
              interaction.resolve({ approved: false });
            }}
          />
        </View>
      </ScreenContainer>
    </Modal>
  );
});
