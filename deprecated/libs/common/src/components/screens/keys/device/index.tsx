import { useTheme } from "@emotion/react";
import {
  getOrCreateDeviceKeyPair,
  KeyType,
  MultisigKey,
  Sdk,
  SecretJsChainIds,
  SecretJsChains,
} from "@obi-wallet/sdk";
import { useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { andThen, compose, otherwise, pathOr } from "ramda";
import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { pubkeyToAddress, SecretNetworkClient } from "secretjs";
import invariant from "tiny-invariant";

import type { DeviceKeyProps, DeviceKeyScreenProps } from "./types";
import { BiometricsData } from "./types";
import { useStore } from "../../../../contexts";
import { Alert, isSmallScreen, isSmallScreenNumber } from "../../../../helpers";
import {
  KeyFlow,
  OnboardingRoute,
  RecoverFrom,
  useRootNavigation,
} from "../../../../router";
import { Draft } from "../../../../stores";
import { AsyncButton } from "../../../buttons";
import { ObiFaceScannerIcon } from "../../../icons";
import { KeyboardAwareScrollView } from "../../../keyboard-aware-scroll-view";
import { OsmosisScreenContainer } from "../../../osmosis-screen-container";
import { Text } from "../../../typography";

const getUsablePublicKeyByType =
  (draft: Draft<MultisigKey>) => async (keyType: KeyType) =>
    pathOr(undefined, ["publicKey", "value"])(
      draft.value.getUsableKeyOfType(keyType),
    );

export const DeviceKeyScreen = observer<DeviceKeyScreenProps>(
  function DeviceKeyScreen({ route }) {
    const { params } = route;

    return (
      <DeviceKey
        {...params}
        onSubmit={async (_userSaysDeviceIsNew, _devicePubKey) => {
          /*
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
          */
        }}
      />
    );
  },
);

export const DeviceKey = observer<DeviceKeyProps>(function DeviceKey({
  draftId,
  demoMode,
  onSubmit,
  flow,
}) {
  const { draftsStore, unityStore } = useStore();
  const draft = draftsStore.get<MultisigKey>({ id: draftId });
  const unityDeviceKey = unityStore.currentDeviceId;
  const queryClient = useQueryClient();
  const [scannedBiometrics, setScannedBiometrics] = useState(false);
  const intl = useIntl();
  const theme = useTheme();
  const navigation = useRootNavigation();

  async function fundKeyIfZero(pubkey: string): Promise<void> {
    const address = pubkeyToAddress(Buffer.from(pubkey, "base64"), "secret");
    console.log("fundKeyIfZero() for address: " + address);
    const [url] = SecretJsChains[SecretJsChainIds.MAINNET].urls;
    const stockClient = new SecretNetworkClient({
      chainId: SecretJsChainIds.MAINNET,
      url,
    });

    const fetchCoin = async () =>
      stockClient.query.bank.balance({
        address,
        denom: "uscrt",
      });

    const getBalance = compose(
      otherwise(() => "0"),
      andThen((coinData) => pathOr("0", ["balance", "amount"])(coinData)),
      fetchCoin,
    );

    const balance = await getBalance();

    // TODO: refactor flow funding address if 0
    try {
      if (balance === "0") {
        const _response = fetch("/api/lend", {
          method: "POST",
          body: JSON.stringify({
            homeChainId: SecretJsChainIds.MAINNET,
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
  ): BiometricsData {
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
          deviceKeypair: keyPair,
        };
      }
      console.log("device key set..");
      await queryClient.prefetchQuery(
        Sdk.chainId(
          draft.value.chainId || SecretJsChainIds.MAINNET,
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

  // TODO: split into multiple fns that read keys otherwise create it
  async function submitWithRequiredKey(
    deviceIsNew: boolean, // would not be needed anymore
    recoverFlow?: boolean, //avoids creating a new account even if no proxy wallets found
  ) {
    let requiredPubkey;
    if (unityDeviceKey) {
      console.log("unity device id obtained");
      const proxyWallets = await draft.value.setUnityKey(
        unityDeviceKey,
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
      requiredPubkey = await getUsablePublicKeyByType(draft)(KeyType.Unity);
      invariant(requiredPubkey, "could not get unity pubkey");
      onSubmit(deviceIsNew, requiredPubkey);
    } else if (scannedBiometrics) {
      requiredPubkey = await getUsablePublicKeyByType(draft)(KeyType.Device);
      invariant(requiredPubkey, "could not get device pubkey");
      onSubmit(deviceIsNew, requiredPubkey);
    } else {
      const res = await scanBiometricsOrWebAuthN(false, deviceIsNew);
      const { success, newUser, deviceKeypair, wallets } = res;
      const _newUser = newUser;
      if (wallets) {
        invariant(deviceKeypair, "could not get device keypair");
        await draft.value.setDeviceKey(
          {
            publicKey: deviceKeypair?.publicKey,
            privateKey: deviceKeypair?.privateKey,
          },
          false,
          true,
        );
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
      if (!wallets && recoverFlow) {
        navigation.navigate(OnboardingRoute.SelectRecoveryMethod, {
          flow: KeyFlow.RecoverWallet,
          draftId,
          demoMode: false,
        });
      } else if (!wallets) {
        await draft.value.createMagicAccount();
        navigation.navigate(OnboardingRoute.CreateWallet, {
          flow: KeyFlow.CreateWallet,
          draftId,
          demoMode: false,
        });
      }
    }
    await fundKeyIfZero(requiredPubkey);
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
              {/*TODO: refactor logic here*/}

              {unityStore.currentDeviceId ? (
                flow === KeyFlow.CreateWallet ? (
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
              ) : flow === KeyFlow.CreateWallet ? (
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
              {unityStore.currentDeviceId ? (
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
              {unityStore.currentDeviceId ? (
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
            {/*TODO: refactor here*/}
            {flow === KeyFlow.CreateWallet ? (
              <AsyncButton
                label={intl.formatMessage({
                  id: unityStore.currentDeviceId
                    ? "onboarding4.biometrics.unitybutton"
                    : "onboarding4.biometrics.button",
                })}
                flavor="primary"
                onPress={async () => submitWithRequiredKey(true, false)}
                autoPress={Platform.OS === "ios"}
              />
            ) : (
              // not CreateWallet flow
              <>
                {/*TODO: refactor submitWithRequiredKey method*/}
                <AsyncButton
                  label={intl.formatMessage({
                    id: unityStore.currentDeviceId
                      ? "onboarding4.ihaveadevicekey.button.unity"
                      : "onboarding4.ihaveadevicekey.button",
                  })}
                  flavor="primary"
                  onPress={async () => submitWithRequiredKey(false, true)}
                  autoPress={Platform.OS === "ios"}
                />
                {/*TODO: refactor submitWithRequiredKey method*/}
                <AsyncButton
                  label={intl.formatMessage({
                    id: "onboarding4.newdevice.button",
                  })}
                  flavor="primary"
                  onPress={async () => submitWithRequiredKey(true, true)}
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
