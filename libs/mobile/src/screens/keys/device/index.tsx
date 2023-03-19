import { pubkeyType } from "@cosmjs/amino";
import { Text } from "@obi-wallet/common";
import { KeyType, MultisigKey } from "@obi-wallet/sdk";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Alert, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

import FaceScanner from "./assets/face-scanner.svg";
import ObiFaceScanner from "./assets/obi-face-scanner.svg";
import Scan from "./assets/scan.svg";
import {
  getBiometricsKeyPair,
  resetBiometricsKeyPair,
} from "../../../app/biometrics";
import { AsyncButton } from "../../../app/button";
import { useRootNavigation } from "../../../app/root-stack";
import { Back } from "../../../app/screens/components/back";
import { Background } from "../../../app/screens/components/background";
import {
  isSmallScreen,
  isSmallScreenNumber,
} from "../../../app/screens/components/screen-size";
import { useStore } from "../../../app/stores";
import { getPrepareKeyQuery } from "../../../queries/keys";
import { KeyRoute, KeyStackParamList } from "../key-stack";

export type DeviceKeyScreenProps = NativeStackScreenProps<
  KeyStackParamList,
  KeyRoute.DeviceKey
>;

export const DeviceKeyScreen = observer<DeviceKeyScreenProps>(
  function DeviceKeyScreen({ route }) {
    const navigation = useRootNavigation();
    const { params } = route;

    return (
      <DeviceKey
        {...params}
        onSubmit={() => {
          navigation.navigate(KeyRoute.PhoneKeyRequest, params);
        }}
      />
    );
  }
);

export interface DeviceKeyProps {
  draftId: string;
  demoMode: boolean;

  onSubmit(): void;
}

export const DeviceKey = observer<DeviceKeyProps>(function DeviceKey({
  draftId,
  demoMode,
  onSubmit,
}) {
  const { configStore, draftsStore } = useStore();
  const draft = draftsStore.get<MultisigKey>({ id: draftId });
  const queryClient = useQueryClient();
  const isObi = configStore.isObi();

  const [scannedBiometrics, setScannedBiometrics] = useState(false);
  const intl = useIntl();

  async function scanBiometrics() {
    try {
      const { publicKey, privateKey } = await getBiometricsKeyPair({
        demoMode,
      });
      draft.value.setKey({
        type: KeyType.Device,
        payload: {
          publicKey: {
            type: pubkeyType.secp256k1,
            value: publicKey,
          },
        },
      });
      void queryClient.prefetchQuery(
        getPrepareKeyQuery({
          chainId: draft.value.chain,
          publicKey,
          privateKey,
        })
      );
      setScannedBiometrics(true);
    } catch (e) {
      setScannedBiometrics(false);
      await resetBiometricsKeyPair();
      const error = e as Error;
      console.error(error);
      Alert.alert(
        intl.formatMessage({ id: "general.error" }) + " ScanMyBiometrics",
        error.message
      );
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isObi ? "#1A1A1A" : "" }}>
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
          <AsyncButton
            label={intl.formatMessage({
              id: "onboarding4.biometrics.button",
            })}
            flavor="blue"
            LeftIcon={isObi ? undefined : Scan}
            onPress={async () => {
              if (scannedBiometrics) {
                onSubmit();
              } else {
                await scanBiometrics();
              }
            }}
            autoPress
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
});
