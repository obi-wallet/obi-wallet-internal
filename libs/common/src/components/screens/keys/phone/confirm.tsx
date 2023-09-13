import { generateSec256k1KeyPair, MultisigKey } from "@obi-wallet/sdk";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useEnv, useStore } from "../../../../contexts";
import { Alert, isSmallScreenNumber } from "../../../../helpers";
import { getTwilioClient } from "../../../../keys";
import {
  KeyFlow,
  KeyRoute,
  KeyStackParamList,
  OnboardingRoute,
  RecoverFrom,
  SettingsRoute,
  useRootNavigation,
} from "../../../../router";
import { KeyboardAvoidingView } from "../../../keyboard-avoiding-view";
import { KeyboardAwareScrollView } from "../../../keyboard-aware-scroll-view";
import { OsmosisScreenContainer } from "../../../osmosis-screen-container";
import { PhoneOneTimeCodeInput } from "../../../phone-key";
import { Text } from "../../../typography";
import { VerifyAndProceedButton } from "../../../verify-and-proceed-button";

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
              navigation.navigate(OnboardingRoute.LookupProxyWallets, {
                ...params,
                recoverFrom: RecoverFrom.Phone,
              });
              break;
          }
        }}
      />
    );
  },
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
    const { chainStore, draftsStore, phoneSessionStore } = useStore();
    const draft = draftsStore.get<MultisigKey>({ id: draftId });
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
      <OsmosisScreenContainer>
        <KeyboardAvoidingView
          style={{
            flex: 1,
          }}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAwareScrollView
              style={{
                flex: 1,
                paddingHorizontal: 20,
              }}
              contentContainerStyle={{
                flex: 1,
                justifyContent: "space-between",
              }}
            >
              <View>
                <View
                  style={{
                    justifyContent: "flex-end",
                    marginTop: 10,
                  }}
                >
                  <View>
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
                        color: "white",
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
                  onResend={async (voice) => {
                    const twilioClient = getTwilioClient({ demoMode, env });
                    // TODO: factor back out this workaround
                    await twilioClient.requestKeyMagicCode({
                      phoneNumber,
                      securityAnswer,
                      chainId,
                      voice,
                    });
                    /*
                    const res = await twilioClient.requestPublicKeyMagicCode({
                      ...data,
                      chainId,
                      voice: false,
                    });
                    */
                  }}
                />
              </View>
              <View style={{ marginVertical: 20 }}>
                <VerifyAndProceedButton
                  onPress={async () => {
                    try {
                      setVerifyButtonDisabledDoubleclick(true);
                      // const twilioClient = getTwilioClient({ demoMode, env });
                      // TODO: Reenable when Jose is done!
                      /*
                      const kp =
                        await twilioClient.parseKeyMagicCodeResponse({
                          key,
                        });
                      */
                      const kp = generateSec256k1KeyPair();
                      /*
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
                      */

                      if (kp.privateKey) {
                        draft.value.setPhoneKey({
                          publicKey: kp.publicKey,
                          phoneNumber,
                          securityQuestion,
                        });
                        phoneSessionStore.setKp(kp);
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
                        error.message,
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
      </OsmosisScreenContainer>
    );
  },
);
