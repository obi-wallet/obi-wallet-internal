import { useTheme } from "@emotion/react";
import { CommunicationType, KeyType, MultisigKey } from "@obi-wallet/sdk";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as secp256k1 from "secp256k1";

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
  /* OnboardingRoute,
  RecoverFrom,
  SettingsRoute,
  useRootNavigation, */
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
        onSubmit={async () => {
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
                walletsFound: [],
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
    // flow,
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
    const theme = useTheme();
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
                paddingHorizontal: 22,
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
                        marginTop: 36,
                      }}
                    >
                      <Text style={theme.phoneKey?.title1}>
                        Create
                        <Text style={theme.phoneKey?.title2}>
                          {" "}
                          a phone number key
                        </Text>
                      </Text>
                      {/* {flow === KeyFlow.EditWallet ? (
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
                      )} */}
                    </Text>
                    <View
                      style={{
                        ...theme.phoneKey?.info,
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontSize: isSmallScreenNumber(12, 14),
                          ...theme.phoneKey?.info.text,
                        }}
                      >
                        <FormattedMessage
                          id="onboarding3.pastereponse"
                          defaultMessage="Paste in the response you received to"
                        />{" "}
                        <Text
                          style={{
                            fontWeight: "600",
                            ...theme.phoneKey?.info.text,
                          }}
                        >
                          {phoneNumber}.
                        </Text>
                      </Text>
                      <Text
                        style={{
                          marginTop: 8,
                          ...theme.phoneKey?.info.text,
                        }}
                      >
                        ZTX does not store any information.
                      </Text>
                    </View>
                  </View>
                </View>

                <PhoneOneTimeCodeInput
                  phoneNumber={phoneNumber}
                  phoneNumberMightBeIncorrect
                  value={key}
                  setValue={setKey}
                  onResend={async (type: CommunicationType) => {
                    const twilioClient = getTwilioClient({ demoMode, env });
                    // TODO: factor back out this workaround
                    await twilioClient.requestPublicKeyMagicCode({
                      phoneNumber,
                      securityAnswer,
                      chainId,
                      type,
                    });
                    /*
                    const res = await twilioClient.requestPublicKeyMagicCode({
                      ...data,
                      chainId,
                      voice: false,
                    });
                    */
                  }}
                  type={KeyType.Phone}
                />
              </View>
              <View style={{ marginVertical: 20 }}>
                <VerifyAndProceedButton
                  onPress={async () => {
                    try {
                      setVerifyButtonDisabledDoubleclick(true);
                      const twilioClient = getTwilioClient({ demoMode, env });
                      let privkey = "";
                      if (
                        /^081081\d{3,}/.test(key) ||
                        /^121994\d{3,}/.test(key)
                      ) {
                        console.log(
                          "dev key. Remember your entry to use again: " + key,
                        );
                        const encoder = new TextEncoder();
                        const data = encoder.encode(
                          key +
                            "12081s1sw8vrast871-f-3pldht9qwfs;k;lsrtarbs8a7d821bnlp",
                        );
                        const hashBuffer = await crypto.subtle.digest(
                          "SHA-256",
                          data,
                        );
                        const hashUint8Array = new Uint8Array(hashBuffer);
                        const base64String = btoa(
                          String.fromCharCode(...hashUint8Array),
                        );
                        privkey = base64String;
                      } else {
                        privkey = await twilioClient.parseKeyMagicCodeResponse({
                          key,
                        });
                      }
                      type Kp = {
                        privateKey: string;
                        publicKey: {
                          type: "tendermint/PubKeySecp256k1";
                          value: string;
                        };
                      };
                      const kp: Kp = {
                        privateKey: privkey,
                        publicKey: {
                          type: "tendermint/PubKeySecp256k1",
                          value: Buffer.from(
                            secp256k1.publicKeyCreate(
                              new Uint8Array(Buffer.from(privkey, "base64")),
                            ),
                          ).toString("base64"),
                        },
                      };

                      if (kp.privateKey) {
                        console.log("setting draft value phone key...");
                        //console.log("Draft is: " + JSON.stringify(draft));
                        draft.value.setPhoneKey({
                          publicKey: kp.publicKey,
                          // TODO: remove
                          privateKey: kp.privateKey,
                          phoneNumber,
                          securityQuestion,
                        });
                        console.log("draft set. Setting store...");
                        phoneSessionStore.setKp(kp);
                        console.log("store set. Setting store...");
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
