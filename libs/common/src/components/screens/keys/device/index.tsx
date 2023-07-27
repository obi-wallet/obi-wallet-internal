import { useTheme } from "@emotion/react";
import { MultisigKey, Sdk } from "@obi-wallet/sdk";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useStore } from "../../../../contexts";
import { Alert, isSmallScreen, isSmallScreenNumber } from "../../../../helpers";
import { createDeviceKeyPair } from "../../../../keys";
import {
  KeyFlow,
  KeyRoute,
  KeyStackParamList,
  keyTypeToKeyRoute,
  OnboardingRoute,
  useRootNavigation,
} from "../../../../router";
import { AsyncButton } from "../../../buttons";
import { ObiFaceScannerIcon } from "../../../icons";
import { KeyboardAwareScrollView } from "../../../keyboard-aware-scroll-view";
import { OsmosisScreenContainer } from "../../../osmosis-screen-container";
import { Text } from "../../../typography";

export type DeviceKeyScreenProps = NativeStackScreenProps<
  KeyStackParamList,
  KeyRoute.DeviceKey
>;

export const DeviceKeyScreen = observer<DeviceKeyScreenProps>(
  function DeviceKeyScreen({ route }) {
    const navigation = useRootNavigation();
    const { configStore } = useStore();
    const { params } = route;

    return (
      <DeviceKey
        {...params}
        onSubmit={() => {
          if (params.flow !== KeyFlow.CreateWallet) {
            navigation.navigate(OnboardingRoute.SelectRecoveryMethod, params);
            return;
          }
          const requiredKeys = configStore.config.keys.required;
          const requiredRoutes = requiredKeys.map(keyTypeToKeyRoute);
          const index = requiredRoutes.indexOf(KeyRoute.DeviceKey);
          if (index === -1 || index + 1 === requiredRoutes.length) {
            navigation.navigate(OnboardingRoute.CreateWallet, params);
            return;
          }
          navigation.navigate(requiredRoutes[index + 1], params);
        }}
      />
    );
  },
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
  const { draftsStore } = useStore();
  const draft = draftsStore.get<MultisigKey>({ id: draftId });
  const queryClient = useQueryClient();
  const [scannedBiometrics, setScannedBiometrics] = useState(false);
  const intl = useIntl();
  const theme = useTheme();

  async function scanBiometrics() {
    try {
      const keyPair = createDeviceKeyPair(demoMode);
      draft.value.setDeviceKey(keyPair);
      void queryClient.prefetchQuery(
        Sdk.chainId(draft.value.chainId).transactions.prepareKeyPairQuery(
          keyPair,
        ),
      );
      setScannedBiometrics(true);
    } catch (e) {
      setScannedBiometrics(false);
      const error = e as Error;

      if (error.message === "code: 13, msg: Cancel") return;
      console.error(error);
      Alert.alert(
        intl.formatMessage({ id: "general.error" }) + " ScanMyBiometrics",
        error.message,
      );
    }
  }

  return (
    <OsmosisScreenContainer>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAwareScrollView
          style={{
            flex: 1,
            paddingHorizontal: 20,
          }}
          contentContainerStyle={{
            flex: 1,
            flexGrow: 1,
            justifyContent: "space-between",
          }}
        >
          <View>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  backgroundColor: "rgba(219, 222, 255, 0.07)",
                  justifyContent: "center",
                  alignItems: "center",
                  width: isSmallScreenNumber(200, 296),
                  height: isSmallScreenNumber(200, 296),
                  borderRadius: isSmallScreenNumber(200, 296),
                }}
              >
                <View
                  style={{
                    backgroundColor: "rgba(219, 222, 255, 0.17)",
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
                    <ObiFaceScannerIcon />
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
                color: "white",
                fontSize: isSmallScreenNumber(12, 14),
                marginTop: 10,
                ...theme.textStyles.light,
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
              flavor="primary"
              onPress={async () => {
                if (scannedBiometrics) {
                  onSubmit();
                } else {
                  await scanBiometrics();
                  if (Platform.OS !== "ios") {
                    onSubmit();
                  }
                }
              }}
              autoPress={Platform.OS === "ios"}
            />
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </OsmosisScreenContainer>
  );
});
