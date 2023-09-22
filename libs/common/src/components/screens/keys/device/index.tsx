import { useTheme } from "@emotion/react";
import {
  KeyType,
  MultisigKey,
  Sdk,
  Secp256k1KeyPair,
  secretJsChains,
} from "@obi-wallet/sdk";
import { getOrCreateDeviceKeyPair } from "@obi-wallet/sdk";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { pubkeyToAddress, SecretNetworkClient } from "secretjs";
import invariant from "tiny-invariant";

import { useStore } from "../../../../contexts";
import { Alert, isSmallScreen, isSmallScreenNumber } from "../../../../helpers";
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
        onSubmit={async () => {
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
  onSubmit(devicePubkey: Secp256k1KeyPair | undefined): void;
  flow: KeyFlow,
}
export const DeviceKey = observer<DeviceKeyProps>(function DeviceKey({
  draftId,
  demoMode,
  onSubmit,
  flow,
}) {
  const { draftsStore, unityStore } = useStore();
  const draft = draftsStore.get<MultisigKey>({ id: draftId });
  const queryClient = useQueryClient();
  const [scannedBiometrics, setScannedBiometrics] = useState(false);
  const intl = useIntl();
  const theme = useTheme();

  async function fundKeyIfZero(pubkey: string): Promise<void> {
    const address = pubkeyToAddress(Buffer.from(pubkey, "base64"), "secret");
    console.log("fundKeyIfZero() for address: " + address);
    const stockClient = new SecretNetworkClient({
      chainId: "secret-4",
      url: secretJsChains["secret-4"].urls[0],
    });
    let balance = "";
    try {
      balance =
        (
          await stockClient.query.bank.balance({
            address,
            denom: "uscrt",
          })
        ).balance?.amount || "0";
    } catch (e) {
      balance = "0";
    }
    try {
      if (balance === "0") {
        const _response = fetch("/api/lend", {
          method: "POST",
          body: JSON.stringify({
            homeChainId: "secret-4",
            address,
          }),
        });
      }
    } catch (e) {
      console.error("Failed to fund webauthn signer", e);
    }
  }

  async function scanBiometrics(
    create: boolean,
  ): Promise<[boolean, boolean, Secp256k1KeyPair | undefined]> {
    try {
      console.log("getting device key...");
      const [keyPair, newUser] = await getOrCreateDeviceKeyPair(
        create,
        demoMode,
      );
      console.log("setting device key...");
      draft.value.setDeviceKey(keyPair);
      console.log("device key set..");
      void queryClient.prefetchQuery(
        Sdk.chainId(
          draft.value.chainId || "secret-4",
        ).transactions.prepareKeyPairQuery(keyPair),
      );
      console.log("returning...");
      setScannedBiometrics(true);
      return [true, newUser, keyPair];
    } catch (e) {
      setScannedBiometrics(false);
      const error = e as Error;

      if (error.message === "code: 13, msg: Cancel")
        return [false, false, undefined];
      console.error(error);
      Alert.alert(
        intl.formatMessage({ id: "general.error" }) + " ScanMyBiometrics",
        error.message,
      );
      return [false, false, undefined];
    }
  }

  return (
    <OsmosisScreenContainer>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAwareScrollView
          style={{
            flex: 1,
            paddingHorizontal: theme.modal.paddingHorizontal || 20,
          }}
          contentContainerStyle={{
            flex: 1,
            flexGrow: 1,
            justifyContent: "space-between",
          }}
        >
          <View>
            {theme.style !== "ztx" && (
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
            )}

            <Text
              style={{
                fontSize: isSmallScreenNumber(20, 24),
                fontWeight: "600",
                color: "#F6F5FF",
                marginTop: 79,
              }}
            >
              {unityStore.getDeviceId ? (
                <FormattedMessage
                  id="onboarding4.authyourkeys.unity"
                  defaultMessage="Create a Gaming Device Key"
                />
              ) : (
                <FormattedMessage
                  id="onboarding4.authyourkeys"
                  defaultMessage="Create a Device Key"
                />
              )}
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
                defaultMessage="With Obi, your Device, phone number, cloud, email, and more combine into a multi-factor authenticator."
              />
            </Text>
          </View>
          <View
            style={{ flex: 1, justifyContent: "flex-end", paddingBottom: 20 }}
          >
            {flow == KeyFlow.CreateWallet ? (
              <AsyncButton
                label={intl.formatMessage({
                  id: unityStore.getDeviceId
                    ? "onboarding4.biometrics.unitybutton"
                    : "onboarding4.biometrics.button",
                })}
                flavor="primary"
                onPress={async () => {
                  if (unityStore.getDeviceId) {
                    console.log("unity device id obtained");
                    draft.value.setUnityKey(unityStore.getDeviceId);
                    // here check if new user or not?
                    invariant(draft.value.getUsableKeyOfType(KeyType.Unity)?.publicKey
                    .value, "unity device id, but no pubkey... set too late?");
                    fundKeyIfZero(
                      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                      draft.value.getUsableKeyOfType(KeyType.Unity)?.publicKey
                        .value!,
                    );
                    onSubmit(undefined);
                  } else if (scannedBiometrics) {
                    onSubmit(undefined);
                  } else {
                    const [success, _newUser, deviceKeypair] =
                      await scanBiometrics(true);
                    invariant(deviceKeypair, "could not get device keypair");
                    fundKeyIfZero(deviceKeypair.publicKey.value);
                    if (success && Platform.OS !== "ios") {
                      onSubmit(deviceKeypair);
                    }
                  }
                }}
                autoPress={Platform.OS === "ios"}
              />
            ) : (
              <AsyncButton
                label={intl.formatMessage({
                  id: "onboarding4.ihaveadevicekey.button",
                })}
                flavor="primary"
                onPress={async () => {
                  if (unityStore.getDeviceId) {
                    // this should check for recovery
                    console.log("unity device id obtained");
                    draft.value.setUnityKey(unityStore.getDeviceId);
                    onSubmit(undefined);
                  } else if (scannedBiometrics) {
                    onSubmit(undefined);
                  } else {
                    const [success, _newUser, deviceKeypair] =
                      await scanBiometrics(false);
                    invariant(deviceKeypair, "could not get device keypair");
                    console.log("Success is: ", success);
                    if (success && Platform.OS !== "ios") {
                      onSubmit(deviceKeypair);
                    }
                  }
                }}
                autoPress={Platform.OS === "ios"}
              />
            )}
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </OsmosisScreenContainer>
  );
});
