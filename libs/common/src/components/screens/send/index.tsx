import { useTheme } from "@emotion/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCurrentWallet } from "@obi-wallet/headless-ui";
import {
  EnrichedToken as OriginalEnrichedToken,
  Message,
  Messages,
  SignAndBroadcastTransactionUserInteraction,
  Token,
  tokenGivenBalances,
} from "@obi-wallet/sdk";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import { Platform, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import invariant from "tiny-invariant";
import { z } from "zod";

import { useStore } from "../../../contexts";
import { address, AddressController, TokenController } from "../../../forms";
import { isSmallScreenNumber } from "../../../helpers";
import {
  EnrichedToken,
  enrichToken,
  useEnrichedBalances,
} from "../../../hooks";
import {
  HomeBottomTabRoute,
  RootRoute,
  RootStackParamList,
} from "../../../router";
import { BaseModal } from "../../base-modal";
import { Button } from "../../buttons";
import { KeyboardAvoidingView } from "../../keyboard-avoiding-view";
import { OsmosisScreenContainer } from "../../osmosis-screen-container";
import { BigNumberish, parseUnits } from "ethers";
import BigNumber from "bignumber.js";

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
  const { configStore } = useStore();
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
        address: configStore.config.ethereumBalances
          ? z.string()
          : address(wallet.chainId),
        token: tokenGivenBalances({
          chainId: wallet.chainId,
          balances: balances.data,
          enrichToken: (token) => {
            return enrichToken({
              chainId: wallet.chainId,
              token,
            }) as OriginalEnrichedToken;
          },
        }),
      }),
    ),
  });

  const selectToken = useCallback(
    (id: string) => {
      setValue("token", {
        id,
        amount: getValues().token.amount,
      });
    },
    [getValues, setValue],
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
  const { chainStore, zauthStore } = useStore();
  const intl = useIntl();

  return (
    <OsmosisScreenContainer>
      <KeyboardAvoidingView style={{ flex: 1 }}>
        <SafeAreaView
          style={{
            flex: 1,
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingVertical: Platform.select({
              ios: isSmallScreenNumber(20, 20),
              android: isSmallScreenNumber(30, 30),
            }),
          }}
        >
          {confirmModalVisible.visible && confirmModalVisible.success ? (
            <SuccessModal
              visible={
                confirmModalVisible.visible && confirmModalVisible.success
              }
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
              <Text
                style={{
                  width: "100%",
                  textAlign: "center",
                  color: "#F6F5FF",
                  fontWeight: "600",
                }}
              >
                <FormattedMessage id="send.send" defaultMessage="Send" />
              </Text>
            </View>
            <View
              style={{
                marginTop: 55,
              }}
            >
              <Controller
                name="address"
                control={control}
                render={({ field, fieldState }) => {
                  return (
                    <AddressController
                      chainId={chainStore.currentChain}
                      label={intl.formatMessage({
                        id: "send.to",
                        defaultMessage: "To",
                      })}
                      placeholder={intl.formatMessage({
                        id: "send.walletaddress",
                        defaultMessage: "Wallet Address",
                      })}
                      field={field}
                      fieldState={fieldState}
                    />
                  );
                }}
              />
            </View>
            <View
              style={{
                marginTop: 35,
              }}
            >
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
          </View>
          <Button
            flavor="primary"
            label={intl.formatMessage({
              id: "send.next",
              defaultMessage: "Next",
            })}
            disabled={!formState.isValid}
            onPress={handleSubmit(async (data) => {
              invariant(wallet, "Expected wallet to be defined.");

              function getMessages(): Message[] {
                if (!wallet.address) return [];

                if (configStore.config.ethereumBalances) {
                  console.warn("sending as userop...");
                  return [
                  {
                    eth: {
                      contractAddress: data.token.id,
                      abi: [
                        {
                            "constant": false,
                            "inputs": [
                                {
                                    "name": "_to",
                                    "type": "address"
                                },
                                {
                                    "name": "_value",
                                    "type": "uint256"
                                }
                            ],
                            "name": "transfer",
                            "outputs": [
                                {
                                    "name": "",
                                    "type": "bool"
                                }
                            ],
                            "payable": false,
                            "stateMutability": "nonpayable",
                            "type": "function"
                        }
                      ],
                      functionName: "transfer",

                      params: [data.address, (data.token as any).amount],
                      tokens: {
                        accessToken: zauthStore.currentTokens?.accessToken!!,
                        refreshToken: zauthStore.currentTokens?.refreshToken!!
                      }
                    },
                    targetChainId: 421613,
                    homeChainId: "secret-4",
                    tokens: {
                      accessToken: zauthStore.currentTokens?.accessToken!!,
                      refreshToken: zauthStore.currentTokens?.refreshToken!!
                    }
                  }];
                }

                return Messages.chainId(wallet.chainId).getSendMessages({
                  fromAddress: wallet.address,
                  toAddress: data.address,
                  // TODO: TypeScript doesn't understand that we receive the processed data here
                  tokens: [data.token as unknown as Token],
                });
              }

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
    </OsmosisScreenContainer>
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
    <BaseModal visible={visible}>
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
              flavor="primary"
              label="Dismiss"
              onPress={() => {
                onDismiss();
              }}
            />
          </View>
        </View>
      </View>
    </BaseModal>
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
    <BaseModal visible={visible}>
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
              flavor="primary"
              label="Dismiss"
              onPress={() => {
                onDismiss();
              }}
            />
          </View>
        </View>
      </View>
    </BaseModal>
  );
});
