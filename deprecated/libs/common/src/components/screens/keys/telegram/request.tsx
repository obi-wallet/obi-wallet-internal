import { useTheme } from "@emotion/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CommunicationType } from "@obi-wallet/sdk";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import { Linking, View } from "react-native";
import { Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import QRCode from "react-qr-code";
import { z } from "zod";

import { useEnv, useStore } from "../../../../contexts";
import { Alert, isSmallScreenNumber } from "../../../../helpers";
import { getTwilioClient } from "../../../../keys";
import {
  KeyFlow,
  KeyRoute,
  KeyStackParamList,
  useRootNavigation,
} from "../../../../router";
import { Button, InlineButton } from "../../../buttons";
import { SpinnerIcon } from "../../../icons/spinner-icon";
import { KeyboardAwareScrollView } from "../../../keyboard-aware-scroll-view";
import { OsmosisScreenContainer } from "../../../osmosis-screen-container";
import {
  SecurityQuestionInput,
  SendMagicSmsButton,
  useSecurityQuestions,
} from "../../../phone-key";
import { TextInput } from "../../../text-input";
import { Text } from "../../../typography";

export type TelegramKeyRequestScreenProps = NativeStackScreenProps<
  KeyStackParamList,
  KeyRoute.TelegramKeyRequest
>;

export const TelegramKeyRequestScreen = observer<TelegramKeyRequestScreenProps>(
  function TelegramKeyRequestScreen({ route }) {
    const navigation = useRootNavigation();
    const { params } = route;

    return (
      <TelegramKeyRequest
        {...params}
        onSubmit={(payload) => {
          navigation.navigate(KeyRoute.TelegramKeyConfirm, {
            ...params,
            ...payload,
          });
        }}
      />
    );
  },
);

const schema = z.object({
  securityQuestion: z.string(),
  securityAnswer: z
    .string()
    .min(3, "Answer must contain at least 3 characters")
    .regex(/^[A-Za-z0-9.\sáéíóúñü_-]*$/, "Answer contains invalid characters"),
  chatID: z.string(),
});

export interface TelegramKeyRequestProps {
  flow: KeyFlow;
  demoMode: boolean;
  chatID?: string;
  onSubmit(payload: {
    chatID: string;
    securityQuestion: string;
    securityAnswer: string;
  }): void;
}

export const TelegramKeyRequest = observer<TelegramKeyRequestProps>(
  function TelegramKeyRequest({ demoMode, flow, onSubmit, ...params }) {
    const _flow = flow;
    const intl = useIntl();
    const { chainStore } = useStore();
    const chainId = chainStore.currentChain;
    const env = useEnv();
    const securityQuestions = useSecurityQuestions();
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(true);

    const { control, formState, handleSubmit } = useForm({
      defaultValues: {
        securityQuestion: securityQuestions[0].value,
        securityAnswer: "",
        chatID: params.chatID || "",
      },
      mode: "onChange",
      resolver: zodResolver(schema),
    });

    return (
      <OsmosisScreenContainer>
        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAwareScrollView
            style={{
              flex: 1,
            }}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View
              style={{
                flexGrow: 1,
                flex: 1,
                paddingHorizontal: 20,
                justifyContent: "space-between",
              }}
            >
              <View>
                <View
                  style={{
                    marginTop: 10,
                    paddingTop: isSmallScreenNumber(0, 36),
                  }}
                >
                  <View>
                    <Text
                      style={{
                        color: "#F6F5FF",
                        fontSize: isSmallScreenNumber(20, 24),
                        fontWeight: "600",
                        marginBottom: 10,
                      }}
                    >
                      {/* {flow === KeyFlow.EditWallet ? (
                        <FormattedMessage
                          id="onboarding2.recovery.authyourkeys"
                          defaultMessage="Create a New Phone Number Key"
                        />
                      ) : flow === KeyFlow.RecoverWallet ? (
                        <FormattedMessage
                          id="onboarding2.recovery.phonenumber"
                          defaultMessage="Recover Your Old Phone Number Key"
                        />
                      ) : (
                        <FormattedMessage
                          id="onboarding2.authyourkeys"
                          defaultMessage="Create a Phone Number Key"
                        />
                      )} */}
                      <Text style={theme.phoneKey?.title1}>
                        Create
                        <Text style={theme.phoneKey?.title2}>
                          {" "}
                          a Telegram key
                        </Text>
                      </Text>
                    </Text>
                    <View
                      style={{
                        ...theme.phoneKey?.info,
                      }}
                    >
                      <Text style={{ ...theme.phoneKey?.info.text }}>
                        ZTX creates a multi-key to login and keep your account
                        secure and recoverable without relying on seed phrases.
                      </Text>
                      <Text
                        style={{
                          marginTop: 8,
                          ...theme.phoneKey?.info.text,
                        }}
                      >
                        ZTX does not store any information.
                      </Text>
                      {/* <Text
                        style={{
                          color: "white",
                          fontSize: isSmallScreenNumber(12, 14),
                          ...theme.TelegramKey.request.info.text,
                        }}
                      >
                        {flow === KeyFlow.EditWallet ? (
                          <FormattedMessage
                            id="onboarding2.recovery.authyourkeyssubtext"
                            defaultMessage="Please answer a security question. It can be the same as your old answer, or different."
                          />
                        ) : (
                          <FormattedMessage
                            id="onboarding2.authyourkeyssubtext"
                            defaultMessage="Please answer a security question."
                          />
                        )} 
                      </Text>
                        */}
                    </View>
                  </View>
                </View>
                <Controller
                  name="securityQuestion"
                  control={control}
                  render={({ field }) => {
                    // TODO: dropdown / select
                    return (
                      <SecurityQuestionInput
                        securityQuestion={field.value}
                        onSecurityQuestionChange={(item) => {
                          field.onChange(item);
                        }}
                      />
                      // <TextInput
                      //   label="Security Question"
                      //   placeholder="Security Question"
                      //   style={{ flex: 1 }}
                      //   invalidMessage={fieldState.error?.message}
                      //   value={
                      //     securityQuestions.find(
                      //       ({ value }) => value === field.value
                      //     )?.label
                      //   }
                      // />
                    );
                  }}
                />
                <Controller
                  name="securityAnswer"
                  control={control}
                  render={({ field, fieldState }) => {
                    return (
                      <TextInput
                        label="Answer"
                        placeholder="Type Answer Here"
                        style={{ flex: 1, marginVertical: 20 }}
                        invalidMessage={fieldState.error?.message}
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                      />
                    );
                  }}
                />
                <Controller
                  name="chatID"
                  control={control}
                  render={({ field, fieldState }) => {
                    return (
                      <TextInput
                        label="Chat ID"
                        placeholder="Paste or Type Chat ID Here"
                        style={{ flex: 1 }}
                        invalidMessage={fieldState.error?.message}
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                      />
                    );
                  }}
                />
              </View>
              <View
                style={{
                  flex: 1,
                  justifyContent: "flex-end",
                  marginBottom: 20,
                }}
              >
                <Modal transparent visible={loading}>
                  <View
                    style={{
                      width: 375,
                      height: 750,

                      justifyContent: "center",
                      alignItems: "center",
                      position: "relative",
                    }}
                  >
                    <View
                      style={{
                        position: "absolute",
                        backgroundColor: theme.background.color,
                        opacity: 0.8,
                        width: "100%",
                        height: "100%",
                      }}
                    />
                    <SpinnerIcon />

                    <View>
                      <Text style={{ color: "white", marginTop: 20 }}>
                        Loading
                      </Text>
                    </View>
                  </View>
                </Modal>
                <Modal transparent visible={showModal}>
                  <View
                    style={{
                      width: 375,
                      height: 750,
                      position: "relative",
                    }}
                  >
                    <OsmosisScreenContainer hideBack hideClose>
                      <View
                        style={{
                          height: "100%",

                          justifyContent: "space-between",
                          paddingHorizontal: 20,
                        }}
                      >
                        <View>
                          <Text
                            style={[
                              theme.phoneKey?.title1,
                              {
                                marginTop: 20,
                                marginBottom: 20,
                                color: theme.colors.text,
                                zIndex: 10,
                              },
                            ]}
                          >
                            Create
                            <Text style={theme.phoneKey?.title2}>
                              {" "}
                              a Telegram key
                            </Text>
                          </Text>
                          <View style={theme.phoneKey?.info}>
                            <Text
                              style={{ color: theme.colors.text, zIndex: 10 }}
                            >
                              To create a telegram key you need to chat with our
                              bot, you can find it using the qr below
                            </Text>
                          </View>
                          <View
                            style={{
                              zIndex: 10,
                              marginHorizontal: "auto",
                            }}
                          >
                            <QRCode
                              value="https://t.me/Obi_telegram_bot"
                              style={{ maxWidth: 200, width: "100%" }}
                            />
                          </View>

                          <InlineButton
                            label="Or click here"
                            onPress={() => {}}
                            style={{ borderWidth: 0 }}
                            onPressOut={() => {
                              Linking.openURL("https://t.me/Obi_telegram_bot");
                            }}
                          />
                        </View>
                        <View style={theme.phoneKey?.info}>
                          <Text
                            style={{ color: theme.colors.text, zIndex: 10 }}
                          >
                            Once you have a chat ID you can continue
                          </Text>
                        </View>
                        <View>
                          <Button
                            flavor="primary"
                            label="Continue"
                            onPress={() => {
                              setShowModal(false);
                            }}
                          />
                        </View>
                      </View>
                    </OsmosisScreenContainer>
                  </View>
                </Modal>

                <SendMagicSmsButton
                  description={intl.formatMessage({
                    id: "onboarding2.bottominfo",
                  })}
                  label="Get Magic Code"
                  disabled={!formState.isValid}
                  onPress={handleSubmit(async (data) => {
                    console.log("data", data);
                    try {
                      const twilioClient = getTwilioClient({ demoMode, env });
                      //TODO: factor back out this workaround (it doesn't await)
                      console.time("requestPublicKeyMagicCode");
                      setLoading(true);
                      const _res = await twilioClient.requestPublicKeyMagicCode(
                        {
                          ...data,
                          phoneNumber: data.chatID,
                          chainId,
                          type: CommunicationType.TELEGRAM,
                        },
                      );
                      setLoading(false);
                      console.timeEnd("requestPublicKeyMagicCode");
                      /*
                      const res = await twilioClient.requestPublicKeyMagicCode({
                        ...data,
                        chainId,
                        voice: false,
                      });
                      */
                      onSubmit(data);
                    } catch (e) {
                      const error = e as Error;
                      console.error(error);
                      Alert.alert(
                        intl.formatMessage({
                          id: "onboarding2.error.sendingsmsfailed",
                        }),
                        error.message,
                      );
                    }
                  })}
                />
              </View>
            </View>
          </KeyboardAwareScrollView>
        </SafeAreaView>
      </OsmosisScreenContainer>
    );
  },
);
