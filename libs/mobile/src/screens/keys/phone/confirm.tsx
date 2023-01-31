import { pubkeyType } from "@cosmjs/amino";
import { MultisigKey, Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Alert, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

import { InlineButton } from "../../../app/button";
import { useRootNavigation } from "../../../app/root-stack";
import { Back } from "../../../app/screens/components/back";
import { Background } from "../../../app/screens/components/background";
import { KeyboardAvoidingView } from "../../../app/screens/components/keyboard-avoiding-view";
import { VerifyAndProceedButton } from "../../../app/screens/components/phone-number/verify-and-proceed-button";
import { isSmallScreenNumber } from "../../../app/screens/components/screen-size";
import InsuranceLogo from "../../../app/screens/onboarding/common/3-phone-number-confirm/assets/insurance-logo.svg";
import { useStore } from "../../../app/stores";
import { TextInput } from "../../../app/text-input";
import {
  parsePublicKeyTextMessageResponse,
  sendPublicKeyTextMessage,
} from "../../../app/text-message";
import { KeyFlow, KeyRoute, KeyStackParamList } from "../key-stack";

export type PhoneKeyConfirmScreenProps = NativeStackScreenProps<
  KeyStackParamList,
  KeyRoute.PhoneKeyConfirm
>;

export const PhoneKeyConfirmScreen = observer<PhoneKeyConfirmScreenProps>(
  function PhoneKeyConfirmScreen({ route }) {
    const navigation = useRootNavigation();
    const { params } = route;

    return (
      <PhoneKeyConfirm
        {...params}
        onSubmit={() => {
          switch (params.flow) {
            case KeyFlow.CreateWallet:
              // TODO: navigate to social key
              break;
            case KeyFlow.ReplaceKey:
              // TODO: navigate to repalce multisig
              break;
            case KeyFlow.RecoverWallet:
              // TODO: navigate to lookup proxy wallets
              break;
          }
        }}
      />
    );
  }
);

export interface PhoneKeyConfirmProps {
  draftId: string;
  flow: KeyFlow;
  demoMode: boolean;

  phoneNumber: string;
  securityQuestion: string;
  securityAnswer: string;

  onSubmit(): void;
}

export const PhoneKeyConfirm = observer<PhoneKeyConfirmProps>(
  function PhoneKeyConfirm({
    draftId,
    flow,
    demoMode,
    phoneNumber,
    securityQuestion,
    securityAnswer,
    onSubmit,
  }) {
    const { configStore, chainStore, draftsStore } = useStore();
    const draft = draftsStore.get<MultisigKey>({ id: draftId });
    const isObi = configStore.isObi();
    const chainId = chainStore.currentChain;
    // const wallet = useMultisigWallet();
    const [key, setKey] = useState("");

    const [verifyButtonDisabled, setVerifyButtonDisabled] = useState(true); // Magic Button disabled by default
    const [
      verifyButtonDisabledDoubleclick,
      setVerifyButtonDisabledDoubleclick,
    ] = useState(false); // Magic Button disable on button-click

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
                style={{
                  justifyContent: "flex-end",
                  marginTop: isObi ? 10 : 43,
                }}
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
                    {flow === KeyFlow.ReplaceKey ? (
                      <FormattedMessage
                        id="onboarding2.recovery.authyourkeys"
                        defaultMessage="Create a Replacement Phone Number Key"
                      />
                    ) : flow === KeyFlow.RecoverWallet ? (
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
                    <Text style={{ fontWeight: "600" }}>{phoneNumber}.</Text>
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
                <Text
                  style={{ color: "rgba(246, 245, 255, 0.6)", fontSize: 12 }}
                >
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
                      phoneNumber,
                      securityAnswer,
                      demoMode,
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
                  &nbsp;{resendCounter}{" "}
                  {resendCounter > 0 ? "seconds" : "second"}.
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
                  />{" "}
                  {phoneNumber}.
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
                      demoMode,
                    });
                    if (publicKey) {
                      draft.value.setPhoneKey({
                        publicKey: {
                          type: pubkeyType.secp256k1,
                          value: publicKey,
                        },
                        phoneNumber,
                        securityQuestion,
                      });
                      setVerifyButtonDisabledDoubleclick(false);
                      onSubmit();
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
);
