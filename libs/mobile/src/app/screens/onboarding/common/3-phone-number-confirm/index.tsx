import { pubkeyType } from "@cosmjs/amino";
import { isMultisigDemoWallet, Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Alert, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

import { InlineButton } from "../../../../button";
import { useMultisigWallet, useStore } from "../../../../stores";
import { TextInput } from "../../../../text-input";
import {
  parsePublicKeyTextMessageResponse,
  sendPublicKeyTextMessage,
} from "../../../../text-message";
import { Back } from "../../../components/back";
import { Background } from "../../../components/background";
import { KeyboardAvoidingView } from "../../../components/keyboard-avoiding-view";
import { VerifyAndProceedButton } from "../../../components/phone-number/verify-and-proceed-button";
import { isSmallScreenNumber } from "../../../components/screen-size";
import {
  OnboardingRoute,
  OnboardingStackParamList,
} from "../../onboarding-stack";
import InsuranceLogo from "./assets/insurance-logo.svg";

export type MultisigPhoneNumberConfirmProps = NativeStackScreenProps<
  OnboardingStackParamList,
  OnboardingRoute.CreateMultisigPhoneNumberConfirm
>;

export function MultisigPhoneNumberConfirm({
  navigation,
  route,
}: MultisigPhoneNumberConfirmProps) {
  const { params } = route;
  const { configStore, chainStore } = useStore();
  const isObi = configStore.isObi();
  const chainId = chainStore.currentChain;
  const wallet = useMultisigWallet();
  const [key, setKey] = useState("");

  const [verifyButtonDisabled, setVerifyButtonDisabled] = useState(true); // Magic Button disabled by default
  const [verifyButtonDisabledDoubleclick, setVerifyButtonDisabledDoubleclick] =
    useState(false); // Magic Button disable on button-click

  const [resendButtonDisabled, setResendButtonDisabled] = useState(false);
  const [resendCounter, setResendCounter] = useState(0);
  const [resendButtonHit, setResendButtonHit] = useState(false);

  useEffect(() => {
    if (resendCounter > 0) {
      setResendButtonDisabled(true);
      setTimeout(() => {
        setResendCounter((counter) => counter - 1);
      }, 1000);
    } else {
      setResendButtonDisabled(false);
    }
  }, [resendCounter]);

  const minInputCharsSMSCode = 8;

  useEffect(() => {
    if (key.length >= minInputCharsSMSCode) {
      setVerifyButtonDisabled(false); // Enable Magic Button if checks are okay
    } else {
      setVerifyButtonDisabled(true);
      setVerifyButtonDisabledDoubleclick(false);
    }
  }, [verifyButtonDisabled, setVerifyButtonDisabled, key]);

  const intl = useIntl();

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
      }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <Background />
        <KeyboardAwareScrollView
          style={{
            flex: 1,
            paddingHorizontal: 20,
          }}
          contentContainerStyle={{ flex: 1, justifyContent: "space-between" }}
        >
          <View>
            <Back
              style={{
                marginLeft: -5,
                padding: 5,
                width: 25,
              }}
            />

            <View
              style={{ justifyContent: "flex-end", marginTop: isObi ? 10 : 43 }}
            >
              <View>
                {isObi ? null : <InsuranceLogo />}
                <Text
                  style={{
                    color: "#F6F5FF",
                    fontSize: isSmallScreenNumber(20, 24),
                    fontWeight: "600",
                    marginTop: 32,
                  }}
                >
                  {wallet.keyInRecovery === "phoneNumber" ? (
                    <FormattedMessage
                      id="onboarding2.recovery.authyourkeys"
                      defaultMessage="Create a Replacement Phone Number Key"
                    />
                  ) : wallet.keyInRecovery === "biometrics" ? (
                    <FormattedMessage
                      id="onboarding2.recovery.phonenumber"
                      defaultMessage="Recover your Phone Number Key"
                    />
                  ) : (
                    <FormattedMessage
                      id="onboarding3.authyourkeys"
                      defaultMessage="Authenticate Your Keys"
                    />
                  )}
                </Text>
                <Text
                  style={{
                    color: isObi ? "white" : "#999CB6",
                    fontSize: isSmallScreenNumber(12, 14),
                    marginTop: 10,
                  }}
                >
                  <FormattedMessage
                    id="onboarding3.pastereponse"
                    defaultMessage="Paste in the response you received to"
                  />{" "}
                  <Text style={{ fontWeight: "600" }}>
                    {params.phoneNumber}.
                  </Text>
                </Text>
              </View>
            </View>
            <TextInput
              placeholder={intl.formatMessage({
                id: "onboarding3.smscodelabel",
              })}
              textContentType="oneTimeCode"
              keyboardType="number-pad"
              style={{ marginTop: 25 }}
              value={key}
              onChangeText={(e) => {
                const reg = /^\d+$/;
                if (reg.test(e)) {
                  setKey(e);
                }
              }}
            />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 24,
              }}
            >
              <Text style={{ color: "rgba(246, 245, 255, 0.6)", fontSize: 12 }}>
                <FormattedMessage
                  id="onboarding3.noresponselabel"
                  defaultMessage="Didn’t receive a response?"
                />
              </Text>

              <InlineButton
                label={intl.formatMessage({ id: "onboarding3.sendagain" })}
                onPress={async () => {
                  setResendCounter(20);
                  setResendButtonHit(true);

                  setKey("");
                  await sendPublicKeyTextMessage({
                    phoneNumber: params.phoneNumber,
                    securityAnswer: params.securityAnswer,
                    demoMode: isMultisigDemoWallet(wallet),
                    chainId,
                  });
                }}
                disabled={resendButtonDisabled}
              />
            </View>

            {resendButtonDisabled && (
              <Text
                style={{
                  color: "rgba(246, 245, 255, 0.6)",
                  fontSize: 12,
                  marginVertical: 10,
                }}
              >
                <FormattedMessage
                  id="onboarding3.sendagain.info.counter"
                  defaultMessage="Your Magic SMS has been resent! Give it some time to arrive. You can try again in "
                />
                &nbsp;{resendCounter} {resendCounter > 0 ? "seconds" : "second"}
                .
              </Text>
            )}

            {resendButtonHit && (
              <Text
                style={{
                  color: "rgba(246, 245, 255, 0.6)",
                  fontSize: 12,
                  marginVertical: 10,
                }}
              >
                <FormattedMessage
                  id="onboarding3.sendagain.info.checknumber"
                  defaultMessage="If you haven't received the SMS please check if your phone number is correct:"
                />
                &nbsp;
                {params.phoneNumber}.
              </Text>
            )}
          </View>
          <View style={{ marginVertical: 20 }}>
            <VerifyAndProceedButton
              onPress={async () => {
                try {
                  setVerifyButtonDisabledDoubleclick(true);
                  const publicKey = await parsePublicKeyTextMessageResponse({
                    key,
                    demoMode: isMultisigDemoWallet(wallet),
                  });
                  if (publicKey) {
                    await wallet.setPhoneNumberKey({
                      publicKey: {
                        type: pubkeyType.secp256k1,
                        value: publicKey,
                      },
                      phoneNumber: params.phoneNumber,
                      securityQuestion: params.securityQuestion,
                    });
                    setVerifyButtonDisabledDoubleclick(false);
                    switch (wallet.keyInRecovery) {
                      case "biometrics":
                        navigation.navigate(OnboardingRoute.LookupProxyWallets);
                        break;
                      case "phoneNumber":
                        navigation.navigate(OnboardingRoute.ReplaceMultisig);
                        break;
                      default:
                        navigation.navigate(
                          OnboardingRoute.CreateMultisigSocial
                        );
                    }
                  } else {
                    setVerifyButtonDisabledDoubleclick(false);
                  }
                } catch (e) {
                  const error = e as Error;
                  setVerifyButtonDisabledDoubleclick(false);
                  console.error(error);
                  Alert.alert(
                    "Error VerifyAndProceedButton (2)",
                    error.message
                  );
                }
              }}
              disabled={
                verifyButtonDisabledDoubleclick
                  ? verifyButtonDisabledDoubleclick
                  : verifyButtonDisabled
              }
            />
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
