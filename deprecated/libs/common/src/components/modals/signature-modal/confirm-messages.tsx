import { useTheme } from "@emotion/react";
import { ChainId, Message, MessageJson, Messages } from "@obi-wallet/sdk";
import Clipboard from "@react-native-clipboard/clipboard";
import { observer } from "mobx-react-lite";
import { ReactNode, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { ModalProps, ScrollView, TouchableOpacity, View } from "react-native";

import { PrettyMessage } from "./pretty-message";
import { Alert } from "../../../helpers";
import { BroadcastingAnimation } from "../../animations";
import { BaseModal } from "../../base-modal";
import { Button } from "../../buttons";
import { OsmosisScreenContainer } from "../../osmosis-screen-container";
import { ScreenContainer } from "../../screen-container";
import { Text } from "../../typography";

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
  hint?: string;
  amount?: string;

  onCancel(): void;

  isOnboarding?: boolean;
  isLogin?: boolean;
  onConfirm(): void;
}

export const ConfirmMessages = observer<ConfirmMessagesProps>(
  function ConfirmMessages(confirmProps) {
    const {
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
      hint,
      amount,

      ...props
    } = confirmProps;

    const intl = useIntl();
    const [selectedTab, setSelectedTab] = useState(Tab.TransactionDetails);
    const theme = useTheme();
    const renderButtons = () => {
      return (
        <>
          <Button
            disabled={disabled}
            flavor="primary"
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
              flavor="cancel"
              label={intl.formatMessage({
                id: "signature.modal.cancel",
                defaultMessage: "Cancel",
              })}
              onPress={() => {
                onCancel();
              }}
            />
          )}
        </>
      );
    };

    const renderTitle = () => {
      if (isOnboarding) {
        return (
          <>
            <Text style={{ color: "white", fontWeight: "700" }}>
              Now sign your first Obi transaction
            </Text>
            <Text style={{ color: "white", opacity: 0.6 }}>
              Use your keys to create your wallet
            </Text>
          </>
        );
      } else {
        return (
          <Text style={{ color: "white", fontSize: 16, fontWeight: "500" }}>
            <FormattedMessage
              id="signature.modal.confirmtx"
              defaultMessage="Confirm Transaction"
            />
          </Text>
        );
      }
    };

    return (
      <BaseModal {...props} visible>
        <OsmosisScreenContainer>
          {loading ? (
            <BroadcastingAnimation />
          ) : (
            <ScreenContainer>
              <View
                style={{
                  height: 50,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {renderTitle()}
              </View>

              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    height: 50,
                    borderBottomColor: "rgba(250,250,250,.2)",
                    borderBottomWidth: 1,
                    marginHorizontal: 10,
                  }}
                >
                  {renderTabButton({
                    tab: Tab.TransactionDetails,
                    label: intl.formatMessage({
                      id: "signature.modal.txdetails",
                      defaultMessage: "Tx Details",
                    }),
                    isObi: true,
                  })}
                  {renderTabButton({
                    tab: Tab.Data,
                    label: intl.formatMessage({
                      id: "signature.modal.data",
                      defaultMessage: "Data",
                    }),
                    isObi: true,
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
                  {renderButtons()}
                </View>
              </View>

              {footer}
            </ScreenContainer>
          )}
        </OsmosisScreenContainer>
      </BaseModal>
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
              style={[
                { color: "#ffffff" },
                selectedTab === tab ? theme.textStyles.bold : undefined,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    function renderTabContent() {
      const messagesSdk = Messages.chainId(chainId);
      const messagesJson = messages.map(messagesSdk.toJSON.bind(messagesSdk));

      switch (selectedTab) {
        case Tab.TransactionDetails:
          return (
            <MessageView
              messages={messagesJson}
              chainId={chainId}
              hint={hint}
              amount={amount}
            />
          );
        case Tab.Data: {
          const data = JSON.stringify(messagesJson, null, 2);
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
  },
);

export const ConfirmMessagesLogin = observer<ConfirmMessagesProps>(
  function ConfirmMessagesLogin({
    loading,
    onCancel,
    footer,
    children,
    ...props
  }) {
    return (
      <BaseModal {...props} visible>
        <OsmosisScreenContainer>
          {loading ? (
            <BroadcastingAnimation />
          ) : (
            <ScreenContainer>
              <View
                style={{
                  height: 50,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "white", fontWeight: "700", fontSize: 16 }}
                >
                  Welcome Back
                </Text>
              </View>

              {children}
              <Button
                flavor="primary"
                label="Skip & Sign For Each Transaction"
                onPress={() => {
                  onCancel();
                }}
                buttonStyle={{ marginBottom: 40 }}
              />
              {footer}
            </ScreenContainer>
          )}
        </OsmosisScreenContainer>
      </BaseModal>
    );
  },
);

interface MessageViewProps {
  messages: MessageJson[];
  chainId: ChainId;
  hint?: string;
  amount?: string;
  isObi?: boolean;
}

const MessageView = observer(function MessageView({
  messages,
  chainId,
  hint,
  amount,
}: MessageViewProps) {
  if (messages.length === 0) return null;
  console.log("in messageview, amount is " + amount);

  return (
    <>
      {messages.map((message, index) => {
        return (
          <PrettyMessage
            key={index}
            message={message}
            chainId={chainId}
            hint={hint}
            amount={amount}
          />
        );
      })}
    </>
  );
});
