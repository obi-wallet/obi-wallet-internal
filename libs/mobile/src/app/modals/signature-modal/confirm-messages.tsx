import { AminoMsg } from "@cosmjs/amino";
import { Text } from "@obi-wallet/common";
import Clipboard from "@react-native-clipboard/clipboard";
import { Msg } from "@terra-money/terra.js";
import { observer } from "mobx-react-lite";
import { ReactNode, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
  Alert,
  Modal,
  ModalProps,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "../../button";
import { Loader } from "../../loader";
import { Background } from "../../screens/components/background";
import { useStore } from "../../stores";
import { PrettyMessage } from "./pretty-message";

enum Tab {
  TransactionDetails,
  Data,
}

export interface ConfirmMessagesProps extends ModalProps {
  loading?: boolean;
  disabled?: boolean;
  cancelable?: boolean;
  messages: readonly AminoMsg[] | readonly Msg.Amino[];
  footer?: ReactNode;
  children?: ReactNode;

  onCancel(): void;

  isOnboarding?: boolean;

  onConfirm(): void;
}

export const ConfirmMessages = observer<ConfirmMessagesProps>(
  ({
    loading,
    disabled,
    cancelable = true,
    messages,
    onCancel,
    onConfirm,
    footer,
    children,
    isOnboarding,
    ...props
  }) => {
    const intl = useIntl();
    const safeArea = useSafeAreaInsets();
    const [selectedTab, setSelectedTab] = useState(Tab.TransactionDetails);
    const { configStore } = useStore();
    const isObi = configStore.isObi();
    const isLoop = configStore.isLoop();

    return (
      <Modal {...props}>
        <View
          style={{ flex: 1, ...(isObi ? { backgroundColor: "#1A1A1A" } : {}) }}
        >
          {loading ? (
            <Loader
              loadingText="Loading..."
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                zIndex: 999,
                position: "absolute",
                backgroundColor: "#100F1D",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
          ) : null}

          <Background />

          <View
            style={{
              height: 50,
              marginTop: safeArea.top,
              justifyContent: "center",
              alignItems: "center",
              marginHorizontal: 20,
            }}
          >
            {isOnboarding ? (
              <>
                <Text style={{ color: "white", fontWeight: "700" }}>
                  Now sign your first Obi transaction
                </Text>
                <Text style={{ color: "white", opacity: 0.6 }}>
                  Use your keys to create your wallet
                </Text>
              </>
            ) : (
              <Text style={{ color: "white", fontSize: 16, fontWeight: "500" }}>
                <FormattedMessage
                  id="signature.modal.confirmtx"
                  defaultMessage="Confirm Transaction"
                />
              </Text>
            )}
          </View>

          <View style={{ marginHorizontal: 20, flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                height: 50,
                ...(isObi && {
                  borderBottomColor: "rgba(250,250,250,.2)",
                  borderBottomWidth: 1,
                }),
                marginHorizontal: isObi ? 10 : 0,
              }}
            >
              {renderTabButton({
                tab: Tab.TransactionDetails,
                label: intl.formatMessage({
                  id: "signature.modal.txdetails",
                  defaultMessage: "Tx Details",
                }),
                isObi,
              })}
              {renderTabButton({
                tab: Tab.Data,
                label: intl.formatMessage({
                  id: "signature.modal.data",
                  defaultMessage: "Data",
                }),
                isObi,
              })}
            </View>

            <View
              style={{
                flex: 1,
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  flex: 1,
                  borderTopRightRadius: 0,
                }}
              >
                <ScrollView
                  style={{
                    flex: 1,
                    padding: 10,
                    ...{ backgroundColor: isLoop ? "#130F23" : "" },
                    marginBottom: 10,
                    borderRadius: 12,
                    borderTopRightRadius: Tab.Data === selectedTab ? 0 : 12,
                    borderTopLeftRadius:
                      Tab.TransactionDetails === selectedTab ? 0 : 12,
                  }}
                >
                  {renderTabContent()}
                </ScrollView>
              </View>

              {children}

              <View>
                {cancelable && (
                  <Button
                    flavor="blue"
                    label={intl.formatMessage({
                      id: "signature.modal.cancel",
                      defaultMessage: "Cancel",
                    })}
                    onPress={() => {
                      onCancel();
                    }}
                  />
                )}
                <Button
                  disabled={disabled}
                  flavor="green"
                  label={intl.formatMessage({
                    id: "signature.modal.confirm",
                    defaultMessage: "Confirm",
                  })}
                  style={{
                    marginVertical: 20,
                  }}
                  onPress={() => {
                    onConfirm();
                  }}
                />
              </View>
            </View>
          </View>

          {footer}
        </View>
      </Modal>
    );

    function renderTabButton({
      tab,
      label,
      isObi = false,
    }: {
      tab: Tab;
      label: string;
      isObi?: boolean;
    }) {
      return (
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            onPress={() => {
              setSelectedTab(tab);
            }}
            style={{
              flex: 1,
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              borderTopLeftRadius: tab === Tab.TransactionDetails ? 12 : 0,
              borderTopRightRadius: tab === Tab.Data ? 12 : 0,
              ...(selectedTab === tab && !isObi
                ? { backgroundColor: "#130F23" }
                : {}),
            }}
          >
            <Text
              style={{
                color: selectedTab === tab && !isObi ? "#89F5C2" : "white",
                textDecorationLine:
                  selectedTab === tab && !isObi ? "underline" : "none",
                ...(selectedTab === tab && isObi
                  ? { fontWeight: "700" }
                  : { fontFamily: "poppins-light" }),
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    function renderTabContent() {
      switch (selectedTab) {
        case Tab.TransactionDetails:
          return <MessageView messages={messages} />;
        case Tab.Data: {
          const data = JSON.stringify(messages, null, 2);
          return (
            <Text
              style={{ color: "#ffffff" }}
              onLongPress={() => {
                Clipboard.setString(data);
                Alert.alert("Data copied to the clipboard");
              }}
            >
              {data}
            </Text>
          );
        }
      }
    }
  }
);

interface MessageViewProps {
  messages: ConfirmMessagesProps["messages"];
  isObi?: boolean;
}

function MessageView({ messages, isObi = false }: MessageViewProps) {
  if (messages.length === 0) return null;

  return (
    <>
      {messages.map((message, index) => {
        return <PrettyMessage key={index} message={message} />;
      })}
    </>
  );
}
