import { useTheme } from "@emotion/react";
import { faQrcode } from "@fortawesome/free-solid-svg-icons/faQrcode";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCurrentWallet } from "@obi-wallet/headless-ui";
import {
  isTerraChain,
  Messages,
  SignAndBroadcastTransactionUserInteraction,
  Token,
  tokenGivenBalances,
} from "@obi-wallet/sdk";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Msg } from "@terra-money/feather.js";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";
import { SafeAreaView } from "react-native-safe-area-context";
import invariant from "tiny-invariant";
import { z } from "zod";

import ObiQr from "./assets/obiqr.svg";
import { TokenController } from "../../../forms";
import { address } from "../../../helpers/validation-helpers";
import { EnrichedToken, useEnrichedBalances } from "../../balances";
import { Button } from "../../button";
import { RootRoute, RootStackParamList } from "../../root-stack";
import { useStore } from "../../stores";
import { TextInput, TextInputInvalidMessage } from "../../text-input";
import { Back } from "../components/back";
import { KeyboardAvoidingView } from "../components/keyboard-avoiding-view";
import { useQrCodeScannerModal } from "../components/qr-code-scanner-modal";
import { isSmallScreenNumber } from "../components/screen-size";
import { HomeBottomTabRoute } from "../home/home-stack";

export type SendScreenProps = NativeStackScreenProps<
  RootStackParamList,
  RootRoute.Send
>;

export const SendScreen = observer<SendScreenProps>(function SendScreen(props) {
  return <SendScreenComponent {...props} asset={props.route.params.asset} />;
});

export const SendScreenComponent = observer<
  SendScreenProps & { asset?: EnrichedToken }
>(function SendScreen({ navigation, asset }) {
  const wallet = useCurrentWallet();
  const balances = useEnrichedBalances({
    address: wallet.address,
    chainId: wallet.chainId,
  });

  const { control, formState, handleSubmit, getValues, setValue } = useForm({
    defaultValues: {
      address: "",
      token: {
        id: asset?.id ?? balances.data[0]?.id ?? "",
        amount: "",
      },
    },
    mode: "onChange",
    resolver: zodResolver(
      z.object({
        address: address(wallet.chainId),
        token: tokenGivenBalances({
          chainId: wallet.chainId,
          balances: balances.data,
        }),
      })
    ),
  });

  const selectToken = useCallback(
    (id: string) => {
      setValue("token", {
        id,
        amount: getValues().token.amount,
      });
    },
    [getValues, setValue]
  );

  const selectedTokenId = getValues().token.id;

  useEffect(() => {
    if (!selectedTokenId && balances.data[0]) {
      selectToken(balances.data[0].id);
    }
  }, [balances, selectedTokenId, selectToken]);

  const [confirmModalVisible, setConfirmModalStatus] = useState<{
    visible?: boolean;
    success?: boolean;
  }>({});
  const { chainStore } = useStore();
  const { prefix } = chainStore.currentChainInformation;
  const intl = useIntl();
  const qrCodeScannerModal = useQrCodeScannerModal(({ data, close }) => {
    if (data.startsWith(prefix)) {
      setValue("address", data);
      close();
    }
  });
  const theme = useTheme();
  const { configStore } = useStore();
  const isLoop = configStore.isLoop();
  const isObi = configStore.isObi();

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}>
      <SafeAreaView
        style={{
          backgroundColor: theme.colors.background,
          flex: 1,
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingVertical: Platform.select({
            ios: isSmallScreenNumber(20, 20),
            android: isSmallScreenNumber(30, 30),
          }),
        }}
      >
        {qrCodeScannerModal.render()}
        {confirmModalVisible.visible && confirmModalVisible.success ? (
          <SuccessModal
            visible={confirmModalVisible.visible && confirmModalVisible.success}
            onDismiss={() => {
              setConfirmModalStatus({ visible: false });
              navigation.navigate(HomeBottomTabRoute.Assets);
            }}
          />
        ) : null}
        {confirmModalVisible.visible && !confirmModalVisible.success ? (
          <FailureModal
            visible={
              confirmModalVisible.visible && !confirmModalVisible.success
            }
            onDismiss={() => {
              setConfirmModalStatus({ visible: false });
            }}
          />
        ) : null}
        <View>
          <View style={{ flexDirection: "row" }}>
            <Back style={{ alignSelf: "flex-start", zIndex: 2 }} />
            <Text
              style={{
                width: "100%",
                textAlign: "center",
                marginLeft: -20,
                color: "#F6F5FF",
                fontWeight: "600",
              }}
            >
              <FormattedMessage id="send.send" defaultMessage="Send" />
            </Text>
          </View>
          <Controller
            name="address"
            control={control}
            render={({ field, fieldState }) => {
              const hasError = fieldState.error !== undefined;
              return (
                <>
                  <View
                    style={{
                      marginTop: 55,
                      flexDirection: "row",
                      alignItems: "flex-end",
                    }}
                  >
                    <TextInput
                      label={intl.formatMessage({
                        id: "send.to",
                        defaultMessage: "To",
                      })}
                      placeholder={intl.formatMessage({
                        id: "send.walletaddress",
                        defaultMessage: "Wallet Address",
                      })}
                      style={{ flex: 1 }}
                      inputStyle={[
                        {
                          borderTopRightRadius: 0,
                          borderBottomRightRadius: 0,
                          borderRightWidth: 0,
                        },
                        hasError
                          ? {
                              borderColor: "#FF2222",
                            }
                          : null,
                      ]}
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                    />
                    <TouchableOpacity
                      style={[
                        {
                          width: 56,
                          height: isSmallScreenNumber(46, 56),
                          justifyContent: "center",
                          alignItems: "center",
                          padding: isObi ? 0 : 5,
                          borderTopRightRadius: isObi ? 32 : 12,
                          borderBottomRightRadius: isObi ? 32 : 12,
                          borderWidth: 1,
                          borderColor: isLoop ? "#2F2B4C" : "white",
                          borderLeftWidth: 0,
                        },
                        hasError
                          ? {
                              borderColor: "#FF2222",
                            }
                          : null,
                      ]}
                      onPress={() => {
                        qrCodeScannerModal.open();
                      }}
                    >
                      <View
                        style={[
                          {
                            position: "absolute",
                            width: 1,
                            backgroundColor: isLoop ? "#2F2B4C" : "white",
                            height: "100%",
                            left: 0,
                          },
                          hasError
                            ? {
                                backgroundColor: "#FF2222",
                              }
                            : null,
                        ]}
                      />
                      {isObi ? (
                        <ObiQr />
                      ) : (
                        <FontAwesomeIcon
                          icon={faQrcode}
                          style={{ color: isLoop ? "#887CEB" : "white" }}
                          size={32}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                  <TextInputInvalidMessage
                    message={fieldState.error?.message}
                  />
                </>
              );
            }}
          />
          <Controller
            name="token"
            control={control}
            render={({ field, fieldState }) => {
              return (
                <TokenController
                  field={field}
                  fieldState={fieldState}
                  balances={balances.data}
                  refetch={balances.refetch}
                />
              );
            }}
          />
        </View>
        <Button
          flavor="blue"
          label={intl.formatMessage({
            id: "send.next",
            defaultMessage: "Next",
          })}
          disabled={!formState.isValid}
          onPress={handleSubmit(async (data) => {
            console.log(data);
            invariant(wallet, "Expected wallet to be defined.");

            function getMessages(): Msg[] {
              if (!wallet.address) return [];

              return Messages.chainId(wallet.chainId).getSendMessages({
                fromAddress: wallet.address,
                toAddress: data.address,
                // TODO: TypeScript doesn't understand that we receive the processed data here
                tokens: [data.token as unknown as Token],
              });
            }

            const chain = wallet.chainId;
            // TODO:
            invariant(isTerraChain(chain), "Expected Terra chain");
            const response =
              await SignAndBroadcastTransactionUserInteraction.start({
                messages: getMessages(),
                demoMode: wallet.isDemo,
                cancelable: true,
                walletMeta: wallet.meta,
              });

            if (response.approved) {
              setConfirmModalStatus({
                visible: true,
                success: response.payload.success,
              });
            }
          })}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
});

interface SuccessModalProps {
  visible?: boolean;
  onDismiss: () => void;
}

const SuccessModal = observer(function SuccessModal({
  visible,
  onDismiss,
}: SuccessModalProps) {
  const theme = useTheme();
  return (
    <Modal isVisible={visible}>
      <View
        style={{
          flex: 1,
          alignItems: "stretch",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            backgroundColor: theme.colors.background,
            borderRadius: 20,
            alignItems: "center",
            paddingVertical: 20,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 19, marginBottom: 10 }}>
            Transaction successful
          </Text>
          <View style={{ marginHorizontal: 20 }}>
            <Button
              flavor="blue"
              label="Dismiss"
              onPress={() => {
                onDismiss();
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
});

interface FailureModalProps {
  visible?: boolean;
  onDismiss: () => void;
}

const FailureModal = observer(function FailureModal({
  visible,
  onDismiss,
}: FailureModalProps) {
  const theme = useTheme();
  return (
    <Modal isVisible={visible}>
      <View
        style={{
          flex: 1,
          alignItems: "stretch",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            backgroundColor: theme.colors.background,
            borderRadius: 20,
            alignItems: "center",
            paddingVertical: 20,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 19, marginBottom: 10 }}>
            Transaction failed
          </Text>
          <View style={{ marginHorizontal: 20 }}>
            <Button
              flavor="blue"
              label="Dismiss"
              onPress={() => {
                onDismiss();
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
});
