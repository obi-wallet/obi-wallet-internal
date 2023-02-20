import { useTheme } from "@emotion/react";
import { faTrash } from "@fortawesome/free-solid-svg-icons/faTrash";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Text } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { Alert, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconButton } from "../../button";
import { useStore } from "../../stores";

export const WalletConnect = observer(function WalletConnect() {
  const { configStore, walletConnectStore } = useStore();
  const isObi = configStore.isObi();
  const theme = useTheme();

  return (
    <SafeAreaView style={{ backgroundColor: theme.colors.background, flex: 1 }}>
      <View style={{ flexGrow: 1 }}>
        <View>
          <Text
            style={{
              color: "#F6F5FF",
              fontSize: 24,
              fontWeight: "600",
            }}
          >
            Open WalletConnect Connections
          </Text>
        </View>
        <ScrollView>
          {walletConnectStore.connectors.map((connector) => {
            return (
              <TouchableOpacity
                key={connector.handshakeTopic}
                style={{
                  height: 79,
                  width: "100%",
                  backgroundColor: isObi ? "#272727" : "#111023",
                  marginBottom: 20,
                  flexDirection: "row",
                  borderRadius: 12,
                  paddingHorizontal: 10,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    paddingHorizontal: 10,
                  }}
                >
                  <Text
                    style={{
                      color: "#F6F5FF",
                      fontSize: 14,
                      fontWeight: "600",
                    }}
                  >
                    {connector.peerMeta?.name}
                  </Text>
                  <Text
                    style={{
                      color: isObi ? "#ffffff80" : "#999CB6",
                      fontSize: 14,
                      fontWeight: "600",
                    }}
                  >
                    {connector.peerMeta?.url}
                  </Text>
                </View>
                <IconButton
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    paddingHorizontal: 10,
                  }}
                  onPress={() => {
                    Alert.alert(
                      "Are you sure?",
                      "This will disconnect the connection.",
                      [
                        {
                          text: "Cancel",
                          style: "cancel",
                        },
                        {
                          text: "Confirm",
                          onPress: async () => {
                            await walletConnectStore.disconnectConnector(
                              connector
                            );
                          },
                        },
                      ]
                    );
                  }}
                >
                  <FontAwesomeIcon
                    icon={faTrash}
                    style={{ color: isObi ? "#fff" : "#7B87A8" }}
                  />
                </IconButton>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
});
