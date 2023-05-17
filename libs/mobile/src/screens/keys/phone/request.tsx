import { isSmallScreenNumber } from "@obi-wallet/common";
import { useStore } from "@obi-wallet/common";
import { Text } from "@obi-wallet/common-deprecated";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Alert, Image, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

import { useRootNavigation } from "../../../app/root-stack";
import { Back } from "../../../app/screens/components/back";
import { Background } from "../../../app/screens/components/background";
import {
  SecurityQuestionInput,
  useSecurityQuestionInput,
} from "../../../app/screens/components/phone-number/security-question-input";
import { SendMagicSmsButton } from "../../../app/screens/components/phone-number/send-magic-sms-button";
import { getTwilioClient } from "../../../app/text-message";
import { PhoneNumberInput } from "../../../components/phone";
import { KeyFlow, KeyRoute, KeyStackParamList } from "../key-stack";

export type PhoneKeyRequestScreenProps = NativeStackScreenProps<
  KeyStackParamList,
  KeyRoute.PhoneKeyRequest
>;

export const PhoneKeyRequestScreen = observer<PhoneKeyRequestScreenProps>(
  function PhoneKeyRequestScreen({ route }) {
    const navigation = useRootNavigation();
    const { params } = route;

    return (
      <PhoneKeyRequest
        {...params}
        onSubmit={(payload) => {
          navigation.navigate(KeyRoute.PhoneKeyConfirm, {
            ...params,
            ...payload,
          });
        }}
      />
    );
  }
);

export interface PhoneKeyRequestProps {
  flow: KeyFlow;
  demoMode: boolean;

  onSubmit(payload: {
    phoneNumber: string;
    securityQuestion: string;
    securityAnswer: string;
  }): void;
}

export const PhoneKeyRequest = observer<PhoneKeyRequestProps>(
  function PhoneKeyRequest({ demoMode, flow, onSubmit }) {
    const intl = useIntl();
    const { configStore, chainStore } = useStore();
    const isObi = configStore.isObi();
    const chainId = chainStore.currentChain;

    const {
      securityQuestion,
      setSecurityQuestion,
      securityAnswer,
      setSecurityAnswer,
    } = useSecurityQuestionInput();
    const [phoneCountryCode, setPhoneCountryCode] = useState("");
    const [phoneNumberWithoutCountryCode, setPhoneNumberWithoutCountryCode] =
      useState("");
    const [phoneNumber, setPhoneNumber] = useState(
      phoneCountryCode + phoneNumberWithoutCountryCode
    );
    const [magicButtonDisabled, setMagicButtonDisabled] = useState(true); // Magic Button disabled by default
    const [magicButtonDisabledDoubleclick, setMagicButtonDisabledDoubleclick] =
      useState(false); // Magic Button disabled on button-click to prevent double-click

    const minInputCharsSecurityAnswer = 3;
    const minInputCharsPhoneNumber = 6;

    useEffect(() => {
      if (
        securityAnswer.length >= minInputCharsSecurityAnswer &&
        phoneNumber.length >= minInputCharsPhoneNumber
      ) {
        setMagicButtonDisabled(false); // Enable Magic Button if checks are okay
      } else {
        setMagicButtonDisabled(true);
      }
    }, [
      magicButtonDisabled,
      setMagicButtonDisabled,
      securityAnswer,
      phoneNumber,
    ]);

    const handleSecurityAnswer = () => {
      if (!securityAnswer) {
        Alert.alert(
          intl.formatMessage({
            id: "onboarding2.error.securityanswermissing.title",
          }),
          intl.formatMessage({
            id: "onboarding2.error.securityanswermissing.text",
          })
        );
        setMagicButtonDisabledDoubleclick(false);
        return false;
      }

      if (
        // Check length
        securityAnswer.length < minInputCharsSecurityAnswer
      ) {
        Alert.alert(
          intl.formatMessage({
            id: "onboarding2.error.securityanswertooshort.title",
          }),
          intl.formatMessage({
            id: "onboarding2.error.securityanswertooshort.text",
          })
        );
        setMagicButtonDisabledDoubleclick(false);
        return false;
      }

      return true;
    };

    const handlePhoneNumber = () => {
      if (!phoneNumberWithoutCountryCode || !phoneCountryCode || !phoneNumber) {
        Alert.alert(
          intl.formatMessage({ id: "onboarding2.error.phonenrmissing.title" }),
          intl.formatMessage({ id: "onboarding2.error.phonenrmissing.text" })
        );
        setMagicButtonDisabledDoubleclick(false);
        return false;
      }

      // Check if phoneNumber has digits only
      const onlyDigitsInPhoneNumber = /^[0-9]+$/.test(
        phoneNumberWithoutCountryCode
      );
      if (!onlyDigitsInPhoneNumber) {
        Alert.alert(
          intl.formatMessage({
            id: "onboarding2.error.phonenrnospecialchars.title",
          }),
          intl.formatMessage({
            id: "onboarding2.error.phonenrnospecialchars.text",
          })
        );
        setMagicButtonDisabledDoubleclick(false);
        return false;
      }

      return true;
    };

    // Function passed down to child component "PhoneInput" as property
    const handlePhoneNumberCountryCode = (countryCode: string) => {
      setPhoneCountryCode(countryCode);
      setPhoneNumber(phoneCountryCode + phoneNumberWithoutCountryCode);
    };

    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Background />
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
              <Back
                style={{
                  marginLeft: -5,
                  padding: 5,
                  width: 25,
                }}
              />
              <View
                style={{
                  marginTop: isObi ? 10 : isSmallScreenNumber(10, 25),
                  paddingTop: isSmallScreenNumber(0, 32),
                }}
              >
                <View>
                  {isObi ? null : (
                    <Image
                      source={require("./assets/phone.png")}
                      style={{ marginBottom: 20 }}
                    />
                  )}
                  <Text
                    style={{
                      color: "#F6F5FF",
                      fontSize: isSmallScreenNumber(20, 24),
                      fontWeight: "600",
                      marginBottom: 10,
                    }}
                  >
                    {flow === KeyFlow.EditWallet ? (
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
                    )}
                  </Text>
                  <Text
                    style={{
                      color: isObi ? "white" : "#999CB6",
                      fontSize: isSmallScreenNumber(12, 14),
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
                </View>
              </View>
              <SecurityQuestionInput
                securityQuestion={securityQuestion}
                onSecurityQuestionChange={setSecurityQuestion}
                securityAnswer={securityAnswer}
                onSecurityAnswerChange={(inputText) => {
                  const reg = /([^A-Za-z0-9.\sáéíóúñü_-])/;
                  if (!reg.test(inputText)) {
                    setSecurityAnswer(inputText);
                  }
                }}
              />

              <PhoneNumberInput
                label={intl.formatMessage({ id: "onboarding2.phonenr" })}
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                placeholder={intl.formatMessage({
                  id: "onboarding2.phonenrlabel",
                })}
                style={{ marginTop: 15 }}
                value={phoneNumberWithoutCountryCode}
                onChangeText={(e) => {
                  const noCountryCode = e.replace(phoneCountryCode, "");
                  const noSpecialChars = noCountryCode.replace(/[^0-9]/gi, "");

                  setPhoneNumberWithoutCountryCode(noSpecialChars);
                  setPhoneNumber(phoneCountryCode + noSpecialChars);
                }}
                handlePhoneNumberCountryCode={handlePhoneNumberCountryCode}
              />
            </View>
            <View
              style={{ flex: 1, justifyContent: "flex-end", marginBottom: 20 }}
            >
              <SendMagicSmsButton
                description={intl.formatMessage({
                  id: "onboarding2.bottominfo",
                })}
                onPress={async () => {
                  setMagicButtonDisabledDoubleclick(true);

                  const checkSecurityAnswer = await handleSecurityAnswer();
                  const checkPhoneNumber = await handlePhoneNumber();

                  if (checkSecurityAnswer && checkPhoneNumber) {
                    try {
                      const twilioClient = getTwilioClient(demoMode);
                      await twilioClient.sendPublicKeyTextMessage({
                        phoneNumber,
                        securityAnswer,
                        chainId,
                      });
                      onSubmit({
                        phoneNumber,
                        securityQuestion,
                        securityAnswer,
                      });
                      setMagicButtonDisabledDoubleclick(false);
                    } catch (e) {
                      const error = e as Error;
                      setMagicButtonDisabledDoubleclick(false);
                      console.error(error);
                      Alert.alert(
                        intl.formatMessage({
                          id: "onboarding2.error.sendingsmsfailed",
                        }),
                        error.message
                      );
                    }
                  } else {
                    setMagicButtonDisabledDoubleclick(false);
                  }
                }}
                disabled={
                  magicButtonDisabledDoubleclick
                    ? magicButtonDisabledDoubleclick
                    : magicButtonDisabled
                }
              />
            </View>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    );
  }
);
