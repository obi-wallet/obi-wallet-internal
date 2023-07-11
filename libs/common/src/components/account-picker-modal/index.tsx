import { useTheme } from "@emotion/react";
import { faTrash } from "@fortawesome/free-solid-svg-icons/faTrash";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { FormattedMessage } from "react-intl";
import { ScrollView, TouchableOpacity, View } from "react-native";

import { useStore } from "../../contexts";
import { Alert, createSessionKey } from "../../helpers";
import { BaseModal } from "../base-modal";
import { IconButton } from "../buttons";
import { Text } from "../typography";

export interface AccountPickerModalProps {
  visible: boolean;
  open(): void;
  close(): void;
}

export function useAccountPickerModalProps() {
  const [visible, setVisible] = useState(false);
  return {
    visible,
    open() {
      setVisible(true);
    },
    close() {
      setVisible(false);
    },
  };
}

export const AccountPickerModal = observer<AccountPickerModalProps>(
  function AccountPickerModal({ visible, close }) {
    const { walletsStore } = useStore();
    const theme = useTheme();

    return (
      <BaseModal visible={visible}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            paddingHorizontal: 20,
            paddingVertical: 20,
          }}
        >
          <View
            style={{
              flexShrink: 1,
              backgroundColor: theme.colors.background,
              padding: 20,
              borderRadius: 12,
            }}
          >
            <View>
              <Text
                style={{
                  color: "#F6F5FF",
                  fontSize: 24,
                  fontWeight: "600",
                  maxHeight: "90%",
                }}
              >
                <FormattedMessage id="login.title" defaultMessage="Login" />
              </Text>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 14,
                  marginTop: 10,
                }}
              >
                <FormattedMessage
                  id="login.subtext"
                  defaultMessage="We found various wallets on-device. You can log back in or add a new one."
                />
              </Text>
            </View>
            <ScrollView>
              {walletsStore.wallets.map((wallet) => {
                const address = theme.ethDemo
                  ? "0x0bA689a1...05342"
                  : wallet.shortenedAddress;

                return (
                  <TouchableOpacity
                    key={wallet.id}
                    style={{
                      height: 79,
                      width: "100%",
                      backgroundColor: theme.colors.panelBackground,
                      marginBottom: 20,
                      flexDirection: "row",
                      borderRadius: 12,
                      paddingHorizontal: 10,
                    }}
                    onPress={() => {
                      walletsStore.setCurrentWallet(wallet);
                      if (theme.loginModal) {
                        createSessionKey({
                          wallet,
                          maxSpend: 5,
                          isLogin: true,
                        });
                      }
                      close();
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
                        {address}
                      </Text>
                      <Text
                        style={{
                          color: "#ffffff80",
                          fontSize: 14,
                          fontWeight: "600",
                        }}
                      >
                        Multisig {wallet.isDemo ? " (Demo Mode)" : ""}
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
                          "This will remove the wallet from device.",
                          [
                            {
                              text: "Cancel",
                              style: "cancel",
                            },
                            {
                              text: "Confirm",
                              onPress: () => {
                                walletsStore.removeWallet(wallet);
                              },
                            },
                          ]
                        );
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faTrash}
                        style={{ color: "#fff" }}
                      />
                    </IconButton>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View
              style={{
                flexShrink: 0,
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                onPress={() => close()}
                style={{ paddingVertical: 15 }}
              >
                <Text style={{ color: "#fff" }}>
                  <FormattedMessage
                    id="accountpickermodal.close"
                    defaultMessage="Close"
                  />
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </BaseModal>
    );
  }
);
