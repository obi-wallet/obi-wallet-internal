import { useTheme } from "@emotion/react";
import { Text, useStore } from "@obi-wallet/common";
import { ChainId, Message } from "@obi-wallet/sdk";
import Clipboard from "@react-native-clipboard/clipboard";
import { Msg } from "@terra-money/feather.js";
import { observer } from "mobx-react-lite";
import { ReactNode, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
  Alert,
  ModalProps,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

import { PrettyMessage } from "./pretty-message";
import { Modal } from "../../../components/modal";
import { Button } from "../../button";
import { Loader } from "../../loader";
import { Background } from "../../screens/components/background";
import { ScreenContainer } from "../../screens/components/screen-container";

enum Tab {
  TransactionDetails,
  Data,
}

export interface ConfirmMessagesProps extends ModalProps {
  loading?: boolean;
  disabled?: boolean;
  cancelable?: boolean;
  messages: Message[];
  chainId: ChainId;
  footer?: ReactNode;
  children?: ReactNode;

  onCancel(): void;

  isOnboarding?: boolean;

  onConfirm(): void;
}

export const ConfirmMessages = observer<ConfirmMessagesProps>(
  function ConfirmMessages({
    loading,
    disabled,
    cancelable = true,
    messages,
    chainId,
    onCancel,
    onConfirm,
    footer,
    children,
    isOnboarding,
    ...props
  }) {
    const intl = useIntl();
    const [selectedTab, setSelectedTab] = useState(Tab.TransactionDetails);
    const { configStore } = useStore();
    const isObi = configStore.isObi();
    const theme = useTheme();
    const isLoop = configStore.isLoop();

    return (
      <Modal {...props}>
        <ScreenContainer>
          {loading ? (
            <Loader
              loadingText="Broadcasting"
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                zIndex: 999,
                position: "absolute",
                backgroundColor: isLoop ? "#100F1D" : theme.colors.background,
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                paddingTop: 50,
                marginTop: -150,
              }}
              animation={require("../../loader/broadcast.json")}
              animationStyles={{
                width: 300,
                height: 300,
                maxHeight: "100%",
                maxWidth: "100%",
              }}
            />
          ) : null}

          <Background />

          <View
            style={{
              height: 50,
              justifyContent: "center",
              alignItems: "center",
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

          <View style={{ flex: 1 }}>
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

              <Button
                disabled={disabled}
                flavor="green"
                label={intl.formatMessage({
                  id: "signature.modal.confirm",
                  defaultMessage: "Confirm",
                })}
                onPress={() => {
                  onConfirm();
                }}
              />
              {cancelable && (
                <Button
                  flavor={isObi ? "cancel" : "blue"}
                  label={intl.formatMessage({
                    id: "signature.modal.cancel",
                    defaultMessage: "Cancel",
                  })}
                  onPress={() => {
                    onCancel();
                  }}
                />
              )}
            </View>
          </View>

          {footer}
        </ScreenContainer>
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
      const aminoMessages = messages.map((message) => message.toAmino());

      switch (selectedTab) {
        case Tab.TransactionDetails:
          return <MessageView messages={aminoMessages} chainId={chainId} />;
        case Tab.Data: {
          const data = JSON.stringify(aminoMessages, null, 2);
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
  messages: Msg.Amino[];
  chainId: ChainId;
  isObi?: boolean;
}

const MessageView = observer(function MessageView({
  messages,
  chainId,
}: MessageViewProps) {
  if (messages.length === 0) return null;

  return (
    <>
      {messages.map((message, index) => {
        return (
          <PrettyMessage key={index} message={message} chainId={chainId} />
        );
      })}
    </>
  );
});
