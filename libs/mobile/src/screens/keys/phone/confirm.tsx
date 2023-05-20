import {
  Back,
  Background,
  getTwilioClient,
  isSmallScreenNumber,
  KeyboardAvoidingView,
  KeyFlow,
  KeyRoute,
  KeyStackParamList,
  OnboardingRoute,
  SettingsRoute,
  Text,
  useEnv,
  useRootNavigation,
  useStore,
  VerifyAndProceedButton,
} from "@obi-wallet/common";
import { MultisigKey } from "@obi-wallet/sdk";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Alert, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

import InsuranceLogo from "./assets/insurance-logo.svg";
import { PhoneOneTimeCodeInput } from "../../../components/phone";

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
              navigation.navigate(OnboardingRoute.CreateWallet, params);
              break;
            case KeyFlow.EditWallet:
              navigation.navigate(SettingsRoute.MultisigSettings);
              break;
            case KeyFlow.RecoverWallet:
              navigation.navigate(OnboardingRoute.LookupProxyWallets, params);
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
    const env = useEnv();
    const [key, setKey] = useState("");

    const [verifyButtonDisabled, setVerifyButtonDisabled] = useState(true); // Magic Button disabled by default
    const [
      verifyButtonDisabledDoubleclick,
      setVerifyButtonDisabledDoubleclick,
    ] = useState(false); // Magic Button disable on button-click

    const minInputCharsSMSCode = 8;

    useEffect(() => {
      if (key.length >= minInputCharsSMSCode) {
        setVerifyButtonDisabled(false); // Enable Magic Button if checks are okay
      } else {
        setVerifyButtonDisabled(true);
        setVerifyButtonDisabledDoubleclick(false);
      }
    }, [verifyButtonDisabled, setVerifyButtonDisabled, key]);

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
                    {flow === KeyFlow.EditWallet ? (
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

              <PhoneOneTimeCodeInput
                phoneNumber={phoneNumber}
                phoneNumberMightBeIncorrect
                value={key}
                setValue={setKey}
                onResend={async () => {
                  const twilioClient = getTwilioClient({ demoMode, env });
                  await twilioClient.sendPublicKeyTextMessage({
                    phoneNumber,
                    securityAnswer,
                    chainId,
                  });
                }}
              />
            </View>
            <View style={{ marginVertical: 20 }}>
              <VerifyAndProceedButton
                onPress={async () => {
                  try {
                    setVerifyButtonDisabledDoubleclick(true);
                    const twilioClient = getTwilioClient({ demoMode, env });
                    const publicKey =
                      await twilioClient.parsePublicKeyTextMessageResponse({
                        key,
                      });
                    if (publicKey) {
                      draft.value.setPhoneKey({
                        publicKey,
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
