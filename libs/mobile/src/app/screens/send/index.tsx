import { useTheme } from "@emotion/react";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons/faAngleDown";
import { faQrcode } from "@fortawesome/free-solid-svg-icons/faQrcode";
import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet/src";
import { zodResolver } from "@hookform/resolvers/zod";
import { Brand } from "@obi-wallet/common";
import { useCurrentWallet } from "@obi-wallet/headless-ui";
import {
  isTerraChain,
  Messages,
  SignAndBroadcastTransactionUserInteraction,
  tokenGivenBalance,
} from "@obi-wallet/sdk";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Msg } from "@terra-money/feather.js";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";
import { SafeAreaView } from "react-native-safe-area-context";
import invariant from "tiny-invariant";
import { z } from "zod";

import ObiQr from "./assets/obiqr.svg";
import { address } from "../../../helpers/validation-helpers";
import { EnrichedToken, useEnrichedBalances } from "../../balances";
import { Button } from "../../button";
import { RootRoute, RootStackParamList } from "../../root-stack";
import { useStore } from "../../stores";
import { TextInput, TextInputInvalidMessage } from "../../text-input";
import { Back } from "../components/back";
import { BottomSheetBackdrop } from "../components/bottomSheetBackdrop";
import { CoinIcon } from "../components/coin-icon";
import { KeyboardAvoidingView } from "../components/keyboard-avoiding-view";
import { useQrCodeScannerModal } from "../components/qr-code-scanner-modal";
import { RefreshableFlatList } from "../components/refreshable-flat-list";
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

  const [denominationOpened, setDenominationOpened] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const triggerBottomSheet = (open: boolean) => {
    if (open) {
      setDenominationOpened(true);
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  };

  const tokenIdRef = useRef(asset?.id ?? balances.data[0]?.id ?? "");
  const balanceRef = useRef(
    balances.data.find((b) => b.id === tokenIdRef.current)
  );

  const { control, formState, handleSubmit, getValues, setValue } = useForm({
    defaultValues: {
      address: "",
      token: {
        id: tokenIdRef.current,
        rawAmount: "",
      },
    },
    mode: "onChange",
    resolver: zodResolver(
      z.object({
        address: address(wallet.chainId),
        token: tokenGivenBalance({
          chainId: wallet.chainId,
          balance: balances.data.find((b) => b.id === tokenIdRef.current),
        }),
      })
    ),
  });
  tokenIdRef.current = getValues("token").id;
  balanceRef.current = balances.data.find((b) => b.id === tokenIdRef.current);

  useEffect(() => {
    const { token } = getValues();
    if (!token.id && balances.data[0]) {
      setValue("token", {
        id: balances.data[0].id,
        rawAmount: token.rawAmount,
      });
    }
  }, [balances, getValues, setValue]);

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
              const hasError = fieldState.error !== undefined;
              return (
                <View style={{ marginTop: 35 }}>
                  <Text
                    style={{
                      color: isLoop ? "#787B9C" : "white",
                      textTransform: "uppercase",
                      fontSize: 10,
                      marginBottom: 12,
                    }}
                  >
                    <FormattedMessage
                      id="send.amount"
                      defaultMessage="Amount"
                    />
                  </Text>
                  <View
                    style={[
                      {
                        borderWidth: 1,
                        borderRadius: 12,
                        borderColor: isLoop ? "#2F2B4C" : "white",
                        padding: 4,
                        flexDirection: "row",
                      },
                      hasError
                        ? {
                            borderColor: "#FF2222",
                          }
                        : null,
                    ]}
                  >
                    <TouchableOpacity
                      style={{
                        borderRadius: 12,
                        flex: 2,
                        backgroundColor: isLoop ? "#17162C" : "#272727",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingVertical: 12,
                        paddingLeft: 12,
                      }}
                      onPress={() => triggerBottomSheet(true)}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "flex-start",
                          flex: 3,
                        }}
                      >
                        <View
                          style={{
                            width: 44,
                            height: 44,
                            marginRight: 12,
                            borderRadius: 44,
                          }}
                        >
                          <CoinIcon source={balanceRef.current?.icon ?? null} />
                        </View>
                        <View style={{ justifyContent: "center" }}>
                          <Text
                            style={{
                              color: "#F6F5FF",
                              fontWeight: "500",
                              fontSize: 14,
                            }}
                          >
                            {balanceRef.current?.denom}
                          </Text>
                          <Text style={{ color: isLoop ? "#999CB6" : "white" }}>
                            {balanceRef.current?.amount}
                          </Text>
                        </View>
                      </View>
                      <View style={{ flex: 1, alignItems: "center" }}>
                        <FontAwesomeIcon
                          icon={faAngleDown}
                          style={{ color: isLoop ? "#7B87A8" : "white" }}
                        />
                      </View>
                    </TouchableOpacity>
                    <TextInput
                      keyboardType="numeric"
                      style={{
                        alignSelf: "center",
                        borderColor: "transparent",
                        flex: 1,
                        paddingLeft: 20,
                        paddingRight: 10,
                      }}
                      inputStyle={{
                        borderColor: "transparent",
                        textAlign: "right",
                        fontSize: 18,
                        fontWeight: "500",
                      }}
                      placeholder="0"
                      value={field.value.rawAmount}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                    />
                  </View>
                  <TextInputInvalidMessage
                    message={fieldState.error?.message}
                  />
                </View>
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
            invariant(wallet, "Expected wallet to be defined.");

            function getMessages(): Msg[] {
              if (!wallet.address) return [];

              return Messages.chainId(wallet.chainId).getSendMessages({
                fromAddress: wallet.address,
                toAddress: data.address,
                tokens: [data.token],
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
        <BottomSheetBackdrop
          onPress={() => triggerBottomSheet(false)}
          visible={denominationOpened}
        />
        <BottomSheet
          handleIndicatorStyle={{ backgroundColor: "white" }}
          backgroundStyle={{
            backgroundColor: isLoop ? "#100F1E" : "#1a1a1a",
          }}
          handleStyle={{ backgroundColor: "transparent" }}
          snapPoints={["60"]}
          enablePanDownToClose={true}
          ref={bottomSheetRef}
          index={-1}
          backdropComponent={() => null}
          onClose={() => {
            setDenominationOpened(false);
          }}
        >
          <BottomSheetView
            style={{
              flex: 1,
              backgroundColor: "transparent",
              position: "relative",
              paddingHorizontal: isLoop ? 20 : 5,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: 10,
                paddingLeft: 10,
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#f6f5ff",
                  }}
                >
                  <FormattedMessage
                    id="send.denomination"
                    defaultMessage="Denomination"
                  />
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: "#f6f5ff",
                    opacity: isLoop ? 0.6 : 1,
                  }}
                >
                  <FormattedMessage
                    id="send.selectcoin"
                    defaultMessage="Select the coin you'd like to send"
                  />
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => triggerBottomSheet(false)}
                style={{ alignSelf: "flex-start" }}
              >
                <FontAwesomeIcon icon={faTimes} style={{ color: "#F6F5FF" }} />
              </TouchableOpacity>
            </View>
            <View
              style={{
                backgroundColor: isLoop ? "transparent" : "#272727",
                flex: 1,
                ...(isObi
                  ? {
                      borderRadius: 7,
                    }
                  : {}),
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  padding: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: isLoop ? "#f6f5ff" : "white",
                    opacity: isLoop ? 0.6 : 1,
                    textTransform: "uppercase",
                  }}
                >
                  <FormattedMessage id="send.name" defaultMessage="Name" />
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: isLoop ? "#f6f5ff" : "white",
                    opacity: isLoop ? 0.6 : 1,
                    textTransform: "uppercase",
                  }}
                >
                  <FormattedMessage
                    id="send.holdings"
                    defaultMessage="Holdings"
                  />
                </Text>
              </View>
              <RefreshableFlatList
                data={balances.data}
                keyExtractor={(item) => item.id}
                renderItem={(props) => (
                  <CoinRenderer
                    {...props}
                    selected={props.item.id === getValues().token.id}
                    onPress={() => {
                      triggerBottomSheet(false);
                      setValue("token", {
                        id: props.item.id,
                        rawAmount: getValues().token.rawAmount,
                      });
                    }}
                  />
                )}
                refetch={balances.refetch}
              />
            </View>
          </BottomSheetView>
        </BottomSheet>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
});

interface CoinRendererProps {
  item: EnrichedToken;
  selected: boolean;
  onPress: () => void;
}

const getBrandBackground = (brand: Brand) => {
  switch (brand) {
    case Brand.Loop:
      return {
        selected: "#17162C",
        unselected: "#100F1E",
      };
    case Brand.Obi:
      return {
        selected: "rgba(0,0,0,0.1)",
        unselected: "transparent",
      };
  }
};

const CoinRenderer = observer(function CoinRenderer({
  item,
  selected,
  onPress,
}: CoinRendererProps) {
  const { configStore } = useStore();
  const brandColors = getBrandBackground(configStore.brand);
  return (
    <TouchableOpacity
      style={{
        backgroundColor: selected
          ? brandColors.selected
          : brandColors.unselected,
        marginVertical: 10,
        padding: 10,
        flexDirection: "row",
        justifyContent: "space-between",
      }}
      onPress={onPress}
    >
      <View style={{ flexDirection: "row" }}>
        <View
          style={{
            width: 36,
            height: 36,
            marginRight: 10,
            borderRadius: 12,
          }}
        >
          <CoinIcon source={item.icon} />
        </View>
        <View>
          <Text style={{ color: "#f6f5ff", fontWeight: "500" }}>
            {item.label}
          </Text>
          <Text
            style={{
              color: "#f6f5ff",
              fontWeight: "500",
              fontSize: 12,
              opacity: 0.6,
            }}
          >
            {item.denom}
          </Text>
        </View>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={{ color: "#f6f5ff", fontWeight: "500" }}>
          ${(item.usdValue ?? 0).toFixed(2)}
        </Text>
        <Text
          style={{
            color: "#f6f5ff",
            fontWeight: "500",
            fontSize: 12,
            opacity: 0.6,
          }}
        >
          {item.amount} {item.denom}
        </Text>
      </View>
    </TouchableOpacity>
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
