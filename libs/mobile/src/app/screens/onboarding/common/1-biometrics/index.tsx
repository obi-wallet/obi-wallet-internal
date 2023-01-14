import { pubkeyType } from "@cosmjs/amino";
import { isMultisigDemoWallet, Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Alert, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  getBiometricsPublicKey,
  resetBiometricsKeyPair,
} from "../../../../biometrics";
import { Button } from "../../../../button";
import { useMultisigWallet, useStore } from "../../../../stores";
import { Back } from "../../../components/back";
import { Background } from "../../../components/background";
import {
  isSmallScreen,
  isSmallScreenNumber,
} from "../../../components/screen-size";
import {
  OnboardingRoute,
  OnboardingStackParamList,
} from "../../onboarding-stack";
import FaceScanner from "./assets/face-scanner.svg";
import ObiFaceScanner from "./assets/obi-face-scanner.svg";
import Scan from "./assets/scan.svg";

export type MultisigBiometricsProps = NativeStackScreenProps<
  OnboardingStackParamList,
  OnboardingRoute.CreateMultisigBiometrics
>;

export const MultisigBiometrics = observer<MultisigBiometricsProps>(
  ({ navigation }) => {
    const wallet = useMultisigWallet();
    const isObi = useStore().configStore.isObi();
    const safeInsets = useSafeAreaInsets();

    const [scannedBiometrics, setScannedBiometrics] = useState(false);
    const intl = useIntl();

    const scanBiometrics = useCallback(async () => {
      setButtonDisabledDoubleclick(true);

      try {
        const demoMode = isMultisigDemoWallet(wallet);
        const publicKey = await getBiometricsPublicKey({
          demoMode,
        });
        await wallet.setBiometricsPublicKey({
          publicKey: {
            type: pubkeyType.secp256k1,
            value: publicKey,
          },
        });
        setScannedBiometrics(true);
        setButtonDisabledDoubleclick(false);
      } catch (e) {
        setScannedBiometrics(false);
        setButtonDisabledDoubleclick(false);
        await resetBiometricsKeyPair();
        const error = e as Error;
        console.error(error);
        Alert.alert(
          intl.formatMessage({ id: "general.error" }) + " ScanMyBiometrics",
          error.message
        );
      }
    }, [intl, wallet]);

    useEffect(() => {
      (async () => {
        const { biometrics } = wallet.nextAdmin;
        if (biometrics && wallet.keyInRecovery !== "biometrics") {
          Alert.alert(
            intl.formatMessage({
              id: "onboarding4.error.biometrickeyexists.title",
            }),
            intl.formatMessage({
              id: "onboarding4.error.biometrickeyexists.text",
            }),
            [
              {
                text: intl.formatMessage({
                  id: "onboarding4.error.biometrickeyexists.newkey",
                }),
                style: "cancel",
                onPress: async () => {
                  await scanBiometrics();
                },
              },
              {
                text: intl.formatMessage({
                  id: "onboarding4.error.biometrickeyexists.yes",
                }),
                onPress: () => {
                  navigation.navigate(
                    OnboardingRoute.CreateMultisigPhoneNumber
                  );
                },
              },
            ]
          );
        } else {
          await scanBiometrics();
        }
      })();
    }, [intl, wallet, navigation, scanBiometrics]);

    const [buttonDisabledDoubleclick, setButtonDisabledDoubleclick] =
      useState(false);

    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: isObi ? "#1A1A1A" : "" }}
      >
        {isObi ? null : <Background />}
        <KeyboardAwareScrollView
          style={{
            flex: 1,
            paddingHorizontal: 20,
          }}
          contentContainerStyle={{
            flexGrow: 1,
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
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  backgroundColor: isObi
                    ? "rgba(219, 222, 255,0.07)"
                    : "rgba(86, 84, 141, 0.07)",
                  justifyContent: "center",
                  alignItems: "center",
                  width: isSmallScreenNumber(200, 296),
                  height: isSmallScreenNumber(200, 296),
                  borderRadius: isSmallScreenNumber(200, 296),
                }}
              >
                <View
                  style={{
                    backgroundColor: isObi
                      ? "rgba(219, 222, 255,0.17)"
                      : "rgba(86, 84, 141, 0.17)",
                    justifyContent: "center",
                    alignItems: "center",
                    width: isSmallScreenNumber(140, 224),
                    height: isSmallScreenNumber(140, 224),
                    borderRadius: isSmallScreenNumber(140, 224),
                  }}
                >
                  <View
                    style={
                      isSmallScreen()
                        ? {
                            width: 70,
                            height: 70,
                            justifyContent: "center",
                            alignItems: "center",
                          }
                        : {
                            width: "50%",
                            height: "50%",
                            justifyContent: "center",
                            alignItems: "center",
                          }
                    }
                  >
                    {isObi ? <ObiFaceScanner /> : <FaceScanner />}
                  </View>
                </View>
              </View>
            </View>

            <Text
              style={{
                fontSize: isSmallScreenNumber(20, 24),
                fontWeight: "600",
                color: "#F6F5FF",
                marginTop: 79,
              }}
            >
              <FormattedMessage
                id="onboarding4.authyourkeys"
                defaultMessage="Authenticate Your Keys"
              />
            </Text>
            <Text
              style={{
                color: isObi ? "white" : "#999CB6",
                fontSize: isSmallScreenNumber(12, 14),
                fontWeight: "400",
                marginTop: 10,
                ...(isObi ? { fontFamily: "poppins-light" } : {}),
              }}
            >
              <FormattedMessage
                id="onboarding4.authyourkeys.subtext"
                defaultMessage="With Obi, your Device, iCloud, and phone number work as a multi-factor authenticator."
              />
            </Text>
          </View>
          <View
            style={{ flex: 1, justifyContent: "flex-end", paddingBottom: 20 }}
          >
            <Button
              label={intl.formatMessage({
                id: "onboarding4.biometrics.button",
              })}
              flavor="blue"
              LeftIcon={isObi ? undefined : Scan}
              onPress={async () => {
                if (scannedBiometrics) {
                  navigation.navigate(
                    OnboardingRoute.CreateMultisigPhoneNumber
                  );
                } else {
                  await scanBiometrics();
                }
              }}
              disabled={buttonDisabledDoubleclick}
            />
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    );
  }
);
