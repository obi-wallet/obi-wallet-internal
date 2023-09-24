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
import {
  Alert,
  activatedRecoveredWallet,
  getProxyWalletsCloudflare,
  isSmallScreen,
  isSmallScreenNumber,
} from "../../../../helpers";
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
import * as A from "../../lookup-proxy-wallets/api-types";

export type DeviceKeyScreenProps = NativeStackScreenProps<
  KeyStackParamList,
  KeyRoute.DeviceKey
>;

export const DeviceKeyScreen = observer<DeviceKeyScreenProps>(
  function DeviceKeyScreen({ route }) {
    const navigation = useRootNavigation();
    const store = useStore();
    const { configStore, draftsStore } = store;
    const { params } = route;

    return (
      <DeviceKey
        {...params}
        onSubmit={async (userSaysDeviceIsNew, devicePubKey) => {
          if (params.flow === KeyFlow.RecoverWallet && userSaysDeviceIsNew) {
            // User says device is new, we must recover with a different key type
            navigation.navigate(OnboardingRoute.SelectRecoveryMethod, params);
            return;
          } else if (
            params.flow === KeyFlow.RecoverWallet &&
            !userSaysDeviceIsNew
          ) {
            // User says device is not new; let's look up its pubkey and only
            // recover if threshold > 1 (currently meaning 1 key needed, not 2 keys)
            // or if there is no match (or there are multiple matches)
            const proxyWallets = await getProxyWalletsCloudflare(devicePubKey);
            const parsedProxyWallets =
              proxyWallets as A.SerializedProxyWallet[];
            if (
              parsedProxyWallets.length !== 1 ||
              parseInt(parsedProxyWallets[0].owner.threshold) > 1
            ) {
              navigation.navigate(OnboardingRoute.SelectRecoveryMethod, params);
            } else {
              const draft = draftsStore.get<MultisigKey>({
                id: params.draftId,
              });
              activatedRecoveredWallet(
                draft,
                undefined,
                store,
                parsedProxyWallets[0],
              );
            }
          } else {
            navigation.navigate(OnboardingRoute.CreateWallet, params);
          }
          const requiredKeys = configStore.config.keys.required;
          const requiredRoutes = requiredKeys.map(keyTypeToKeyRoute);
          const index = requiredRoutes.indexOf(KeyRoute.DeviceKey);
          if (index === -1 || index + 1 === requiredRoutes.length) {
            navigation.navigate(OnboardingRoute.RecoverWallet, params);
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
  onSubmit(
    userSaysDeviceIsNew: boolean,
    deviceOrUnityPubkeyBase64: string,
  ): void;
  flow: KeyFlow;
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

  async function scanBiometricsOrWebAuthN(
    create: boolean,
    userSaysDeviceIsNew?: boolean,
  ): Promise<[boolean, boolean, Secp256k1KeyPair | undefined]> {
    if (userSaysDeviceIsNew === undefined) {
      userSaysDeviceIsNew = true;
    }
    try {
      console.log("getting device key...");
      const [keyPair, newUser] = await getOrCreateDeviceKeyPair(
        create,
        demoMode,
      );
      console.log("setting device key...");
      draft.value.setDeviceKey(keyPair, !userSaysDeviceIsNew);
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

  async function submitWithRequiredKey(userSaysDeviceIsNew: boolean) {
    let requiredPubkey;
    if (unityStore.getDeviceId) {
      console.log("unity device id obtained");
      draft.value.setUnityKey(unityStore.getDeviceId, true);
      requiredPubkey = draft.value.getUsableKeyOfType(KeyType.Unity)?.publicKey
        .value;
      invariant(requiredPubkey, "could not get unity pubkey");
      onSubmit(userSaysDeviceIsNew, requiredPubkey);
    } else if (scannedBiometrics) {
      requiredPubkey = draft.value.getUsableKeyOfType(KeyType.Device)?.publicKey
        .value;
      invariant(requiredPubkey, "could not get device pubkey");
      onSubmit(userSaysDeviceIsNew, requiredPubkey);
    } else {
      const [success, _newUser, deviceKeypair] = await scanBiometricsOrWebAuthN(
        false,
        userSaysDeviceIsNew,
      );
      requiredPubkey = deviceKeypair?.publicKey.value;
      invariant(requiredPubkey, "could not get device pubkey");
      console.log("Success is: ", success);
      if (success && Platform.OS !== "ios") {
        onSubmit(userSaysDeviceIsNew, requiredPubkey);
      }
    }
    fundKeyIfZero(requiredPubkey);
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
                flow == KeyFlow.CreateWallet ? (
                  <FormattedMessage
                    id="onboarding4.authyourkeys.unity"
                    defaultMessage="Create a Gaming Device Key"
                  />
                ) : (
                  <FormattedMessage
                    id="onboarding4.authyourkeys.login.unity"
                    defaultMessage="Use This Game Device Key"
                  />
                )
              ) : flow == KeyFlow.CreateWallet ? (
                <FormattedMessage
                  id="onboarding4.authyourkeys"
                  defaultMessage="Create a Device Key"
                />
              ) : (
                <FormattedMessage
                  id="onboarding4.authyourkeys.login"
                  defaultMessage="Use this Device Key"
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
              {unityStore.getDeviceId ? (
                <FormattedMessage
                  id="onboarding4.authyourkeys.subtext"
                  defaultMessage="With Obi, your Device, phone number, cloud, email, and more combine into a multi-factor authenticator."
                />
              ) : (
                <FormattedMessage
                  id="onboarding4.authyourkeys.subtext"
                  defaultMessage="With Obi, your Device, phone number, cloud, email, and more combine into a multi-factor authenticator."
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
              {unityStore.getDeviceId ? (
                <FormattedMessage
                  id="onboarding4.authyourkeys.explain"
                  defaultMessage="Unity games on this device can provide a secure key, even if you reinstall a game. The games cannot use the key on their own."
                />
              ) : (
                <FormattedMessage
                  id="onboarding4.authyourkeys.subtext"
                  defaultMessage="Your browser will display a WebAuthN request to use your Windows Hello, Touch ID, or other authentication method. Keys cannot leave your device."
                />
              )}
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
                  submitWithRequiredKey(true);
                }}
                autoPress={Platform.OS === "ios"}
              />
            ) : (
              // not CreateWallet flow
              <>
                <AsyncButton
                  label={intl.formatMessage({
                    id: unityStore.getDeviceId
                      ? "onboarding4.ihaveadevicekey.button.unity"
                      : "onboarding4.ihaveadevicekey.button",
                  })}
                  flavor="primary"
                  onPress={async () => {
                    submitWithRequiredKey(false);
                  }}
                  autoPress={Platform.OS === "ios"}
                />
                <AsyncButton
                  label={intl.formatMessage({
                    id: "onboarding4.newdevice.button",
                  })}
                  flavor="primary"
                  onPress={async () => {
                    submitWithRequiredKey(true);
                  }}
                  autoPress={Platform.OS === "ios"}
                />
              </>
            )}
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </OsmosisScreenContainer>
  );
});
