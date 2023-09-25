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
  activateRecoveredWalletAndIsUpdateRequired,
  getProxyWalletsCloudflare,
  isSmallScreen,
  isSmallScreenNumber,
} from "../../../../helpers";
import {
  KeyFlow,
  KeyRoute,
  KeyStackParamList,
  OnboardingRoute,
  RecoverFrom,
  useRootNavigation,
} from "../../../../router";
import { AsyncButton } from "../../../buttons";
import { ObiFaceScannerIcon } from "../../../icons";
import { KeyboardAwareScrollView } from "../../../keyboard-aware-scroll-view";
import { OsmosisScreenContainer } from "../../../osmosis-screen-container";
import { Text } from "../../../typography";
import * as A from "../../lookup-proxy-wallets/api-types";
import { SerializedProxyWallet } from "../../lookup-proxy-wallets/api-types";

export type DeviceKeyScreenProps = NativeStackScreenProps<
  KeyStackParamList,
  KeyRoute.DeviceKey
>;

export const DeviceKeyScreen = observer<DeviceKeyScreenProps>(
  function DeviceKeyScreen({ route }) {
    const navigation = useRootNavigation();
    const store = useStore();
    const { draftsStore } = store;
    const { params } = route;

    return (
      <DeviceKey
        {...params}
        onSubmit={async (userSaysDeviceIsNew, devicePubKey) => {
          // no matter what, we try to recover if match is found
          console.log("In device key screen, flow is " + params.flow);
          const proxyWallets = await getProxyWalletsCloudflare(devicePubKey);
          const parsedProxyWallets = proxyWallets as A.SerializedProxyWallet[];
          if (
            parsedProxyWallets.length !== 1 ||
            parseInt(parsedProxyWallets[0].owner.threshold) > 1
          ) {
            navigation.navigate(OnboardingRoute.SelectRecoveryMethod, params);
          } else {
            const draft = draftsStore.get<MultisigKey>({
              id: params.draftId,
            });
            activateRecoveredWalletAndIsUpdateRequired(
              draft,
              undefined,
              store,
              parsedProxyWallets[0],
            );
          }
          // if no hits, but user is trying to log in, we must recover
          // with a different key type
          if (params.flow === KeyFlow.RecoverWallet) {
            navigation.navigate(OnboardingRoute.SelectRecoveryMethod, params);
            return;
          } else {
            navigation.navigate(OnboardingRoute.CreateWallet, params);
            return;
          }
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
  const navigation = useRootNavigation();

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
    existingUserSaysDeviceIsNew?: boolean,
    recoverFlow?: boolean, //avoids creating a new account even if no proxy wallets found
  ): Promise<{
    wallets?: SerializedProxyWallet[] | undefined;
    deviceKeypair?: Secp256k1KeyPair | undefined;
    success?: boolean | undefined;
    newUser?: boolean | undefined;
  }> {
    try {
      console.log("getting device key...");
      const [keyPair, newUser] = await getOrCreateDeviceKeyPair(
        create,
        demoMode,
      );
      console.log("setting device key...");
      const proxyWallets = await draft.value.setDeviceKey(
        keyPair,
        existingUserSaysDeviceIsNew,
        recoverFlow, //avoids creating a new account even if no proxy wallets found
      );
      if (proxyWallets !== undefined) {
        return {
          wallets: proxyWallets,
        };
      }
      console.log("device key set..");
      void queryClient.prefetchQuery(
        Sdk.chainId(
          draft.value.chainId || "secret-4",
        ).transactions.prepareKeyPairQuery(keyPair),
      );
      console.log("returning...");
      setScannedBiometrics(true);
      return {
        success: true,
        newUser,
        deviceKeypair: keyPair,
      };
    } catch (e) {
      setScannedBiometrics(false);
      const error = e as Error;

      if (error.message === "code: 13, msg: Cancel")
        return {
          success: false,
          newUser: false,
          deviceKeypair: undefined,
        };
      console.error(error);
      Alert.alert(
        intl.formatMessage({ id: "general.error" }) + " ScanMyBiometrics",
        error.message,
      );
      return {
        success: false,
        newUser: false,
        deviceKeypair: undefined,
      };
    }
  }

  async function submitWithRequiredKey(
    deviceIsNew: boolean,
    recoverFlow?: boolean, //avoids creating a new account even if no proxy wallets found
  ) {
    let requiredPubkey;
    if (unityStore.getDeviceId) {
      console.log("unity device id obtained");
      const proxyWallets = await draft.value.setUnityKey(
        unityStore.getDeviceId,
        deviceIsNew,
        recoverFlow,
      );
      if (proxyWallets !== undefined) {
        navigation.navigate(OnboardingRoute.LookupProxyWallets, {
          flow: KeyFlow.RecoverWallet,
          draftId,
          walletsFound: proxyWallets,
          demoMode: false,
          recoverFrom: RecoverFrom.Unity,
        });
      }
      requiredPubkey = draft.value.getUsableKeyOfType(KeyType.Unity)?.publicKey
        .value;
      invariant(requiredPubkey, "could not get unity pubkey");
      onSubmit(deviceIsNew, requiredPubkey);
    } else if (scannedBiometrics) {
      requiredPubkey = draft.value.getUsableKeyOfType(KeyType.Device)?.publicKey
        .value;
      invariant(requiredPubkey, "could not get device pubkey");
      onSubmit(deviceIsNew, requiredPubkey);
    } else {
      const res = await scanBiometricsOrWebAuthN(false, deviceIsNew);
      const { success, newUser, deviceKeypair, wallets } = res;
      const _newUser = newUser;
      if (wallets) {
        navigation.navigate(OnboardingRoute.LookupProxyWallets, {
          flow: KeyFlow.RecoverWallet,
          draftId,
          walletsFound: wallets,
          demoMode: false,
          recoverFrom: RecoverFrom.Device,
        });
      }
      requiredPubkey = deviceKeypair?.publicKey.value;
      invariant(requiredPubkey, "could not get device pubkey");
      console.log("Success is: ", success);
      if (success && Platform.OS !== "ios") {
        onSubmit(deviceIsNew, requiredPubkey);
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
                  id="onboarding4.authyourkeys.subtext.unity"
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
                  id="onboarding4.authyourkeys.explain.unity"
                  defaultMessage="Unity games on this device can provide a secure key, even if you reinstall a game. The games cannot use the key on their own."
                />
              ) : (
                <FormattedMessage
                  id="onboarding4.authyourkeys.explain"
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
                  submitWithRequiredKey(true, false);
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
                    submitWithRequiredKey(false, true);
                  }}
                  autoPress={Platform.OS === "ios"}
                />
                <AsyncButton
                  label={intl.formatMessage({
                    id: "onboarding4.newdevice.button",
                  })}
                  flavor="primary"
                  onPress={async () => {
                    submitWithRequiredKey(true, true);
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
