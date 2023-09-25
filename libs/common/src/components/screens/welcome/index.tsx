import { useTheme } from "@emotion/react";
import {
  Key,
  KeyType,
  MultisigKey,
  MultisigWallet,
  ObservableMultisigKey,
  Serialized,
} from "@obi-wallet/sdk";
import { WelcomeButton } from "@obi-wallet/theme";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useIntl } from "react-intl";
//import { Image, Text, TouchableOpacity, View } from "react-native";

import { WelcomeLayout } from "./layout";
import { useStore } from "../../../contexts";
import { Alert } from "../../../helpers";
import {
  KeyFlow,
  KeyRoute,
  OnboardingRoute,
  OnboardingStackParamList,
  useRootNavigation,
} from "../../../router";
import {
  AccountPickerModal,
  useAccountPickerModalProps,
} from "../../account-picker-modal";
import { Button } from "../../buttons";
import { SerializedProxyWallet } from "../lookup-proxy-wallets/api-types";

export type WelcomeScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  OnboardingRoute.Welcome
>;

export const WelcomeScreen = observer<WelcomeScreenProps>(
  function WelcomeScreen() {
    const navigation = useRootNavigation();
    const { chainStore, configStore, draftsStore, unityStore, walletsStore } =
      useStore();

    async function onCreate() {
      console.log(
        "chain ID in onCreate(): " + JSON.stringify(chainStore.currentChain),
      );
      const newMultisigKey = ObservableMultisigKey.create(
        undefined,
        chainStore.currentChain,
      );
      console.log("multisig created");
      if (unityStore.getDeviceId) {
        // even tho user clicked Sign Up,
        // let's check for wallets with this unity key immediately
        const proxyWallets = await newMultisigKey.setUnityKey(
          unityStore.getDeviceId,
        );
        const draftId = draftsStore.create({
          original: newMultisigKey,
        });
        if (proxyWallets?.length) {
          if (
            proxyWallets.length > 1 ||
            proxyWallets[0].owner.threshold != "1"
          ) {
            navigation.navigate(OnboardingRoute.SelectRecoveryMethod, {
              draftId,
              flow: KeyFlow.RecoverWallet,
              demoMode: false,
            });
          } else {
            await loginFromSerializedDataAndUsableKey(
              proxyWallets[0],
              newMultisigKey,
            );
          }
        } else {
          const draft = draftsStore.get<MultisigKey>({ id: draftId });
          draft.value.createMagicAccount();
          navigation.navigate(OnboardingRoute.CreateWallet, {
            draftId,
            flow: KeyFlow.CreateWallet,
            demoMode: false,
          });
        }
      } else {
        const draftId = draftsStore.create({
          original: newMultisigKey,
        });
        console.log("draft created");
        navigation.navigate(KeyRoute.DeviceKey, {
          draftId,
          flow: KeyFlow.CreateWallet,
          demoMode: false,
        });
      }
    }

    /*
    async function onZepeto() {
      const body = JSON.stringify({
        homeChainId: "secret-4",
        accessToken: zauthStore.currentTokens?.accessToken,
        refreshToken: zauthStore.currentTokens?.refreshToken,
      });
      console.log("on zepeto create account msg: " + body);
      const response = await fetch("/api/zauth/create-account", {
        method: "POST",
        body,
      });

      const { publicKey, proxyAddress, ethereumAccount } =
        await response.json();

      const wallet = ObservableMultisigWallet.create({
        type: "multisig",
        data: {
          chain: "secret-4",
          owner: {
            keys: [
              {
                type: KeyType.ZAuth,
                payload: {
                  publicKey,
                  privateKey: "",
                },
              },
            ],
            threshold: 1,
          },
          proxyAddress: {
            v: 1,
            address: proxyAddress,
          },
          gatekeeperConfig: createGatekeeperConfig().toJSON(),
          singlesigWallets: [],
          currentAccount: null,
        },
      });

      sdkRootStore.ethereumDemoStore.setEthereumAccount(
        proxyAddress,
        ethereumAccount,
      );
      walletsStore.upsertWallet(wallet);
      walletsStore.setCurrentWallet(wallet);
    }
    */

    async function loginFromSerializedDataAndUsableKey(
      serializedWallet: SerializedProxyWallet,
      usableMultisig: MultisigKey,
    ) {
      const serializedData: Serialized<MultisigWallet>["data"] = {
        chain: "secret-4",
        owner: {
          threshold: parseInt(serializedWallet.owner.threshold, 10),
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          keys: serializedWallet.owner.keys.map(
            (key): Serialized<typeof Key> => {
              switch (key.type) {
                case KeyType.Device: {
                  return {
                    type: KeyType.Device,
                    payload: {
                      publicKey: key.publicKey,
                    },
                  };
                }
                case KeyType.Email:
                  return {
                    payload: {
                      type: key.type,
                      publicKey: key.publicKey,
                    },
                  };
                case KeyType.Phone:
                  return {
                    payload: {
                      type: key.type,
                      publicKey: key.publicKey,
                    },
                  };
                case KeyType.Social:
                  return {
                    type: KeyType.Social,
                    payload: {
                      publicKey: key.publicKey,
                    },
                  };
                case KeyType.Unity: {
                  return {
                    type: KeyType.Unity,
                    payload: {
                      publicKey: key.publicKey,
                      privateKey:
                        usableMultisig.getUsableKeyOfType(KeyType.Unity)
                          ?.payload.privateKey ?? "",
                    },
                  };
                }
                case KeyType.Cloud:
                case KeyType.Nfc:
                  return {
                    payload: {
                      type: key.type,
                      publicKey: key.publicKey,
                    },
                  };
                default:
                  return {
                    payload: {
                      type: key.type,
                      publicKey: key.publicKey,
                    },
                  };
              }
            },
          ),
          evmSigningAddress: serializedWallet.evmSigningAddress!,
          evmUserContractAddress: serializedWallet.evmUserContractAddress,
        },
        proxyAddress: {
          v: 1,
          address: serializedWallet.proxyAddress.address,
        },
        // TODO: fetch from chain?
        gatekeeperConfig: {
          beneficiaries: [],
          flexAccounts: [],
        },
        singlesigWallets: [],
        currentAccount: null,
        evmSigningAddress: serializedWallet.evmSigningAddress!,
        evmUserContractAddress: serializedWallet.evmUserContractAddress,
      };

      const currentOwner = ObservableMultisigKey.create(
        {
          homeAccountAddress: serializedData.proxyAddress.address,
          evmSigningAddress: serializedData.evmSigningAddress,
          evmUserContractAddress: serializedData.evmUserContractAddress,
          ownerIndex: 0,
        },
        serializedData.chain,
        serializedData.owner,
      );
      const draftId = draftsStore.create({
        original: currentOwner,
      });
      const draft = draftsStore.get<MultisigKey>({ id: draftId });

      console.log("recovered draft: " + JSON.stringify(draft.value));
      await walletsStore.createWallet({
        multisigKey: draft.value,
        demoMode: false,
        skipInit: true,
        evmSigningAddressOverride: serializedData.evmSigningAddress,
        evmUserContractAddressOverride: serializedData.evmUserContractAddress,
        homeAccountAddressOverride: serializedData.proxyAddress.address,
      });
    }

    async function onRecover() {
      const newMultisigKey = ObservableMultisigKey.create(
        undefined,
        chainStore.currentChain,
      );
      if (unityStore.getDeviceId) {
        // check if this device key is already associated with wallets
        const proxyWallets = await newMultisigKey.setUnityKey(
          unityStore.getDeviceId,
          false,
          true,
        );
        console.log("Proxy wallet found: " + JSON.stringify(proxyWallets![0]));
        if (
          proxyWallets?.length === 1 &&
          proxyWallets[0].owner.threshold === "1"
        ) {
          loginFromSerializedDataAndUsableKey(proxyWallets[0], newMultisigKey);
        } else {
          // multiple proxy wallets, or none found for just
          // this device key
          const draftId = draftsStore.create({
            original: newMultisigKey,
          });
          navigation.navigate(OnboardingRoute.SelectRecoveryMethod, {
            draftId,
            flow: KeyFlow.RecoverWallet,
            demoMode: false,
          });
          return;
        }
      } else {
        // else if not unity...
        const draftId = draftsStore.create({
          original: newMultisigKey,
        });
        navigation.navigate(KeyRoute.DeviceKey, {
          draftId,
          flow: KeyFlow.RecoverWallet,
          demoMode: false,
        });
      }
    }

    function onEnterDemoMode() {
      const newMultisigKey = ObservableMultisigKey.create(
        undefined,
        chainStore.currentChain,
      );
      const draftId = draftsStore.create({
        original: newMultisigKey,
      });

      // Fake platform recovery key
      if (configStore.config.ethereumBalances) {
        const draft = draftsStore.get<MultisigKey>({ id: draftId });
        draft.value.setSocialKey({
          type: "tendermint/PubKeySecp256k1",
          value: "A4TlI8UUTtpSI+oZ9q0dnXJoK9GiE/iMoy5cdMO2HNTI",
        });
      }

      navigation.navigate(KeyRoute.DeviceKey, {
        draftId,
        flow: KeyFlow.CreateWallet,
        demoMode: true,
      });
    }

    return (
      <Welcome
        onCreate={onCreate}
        // onZepeto={onZepeto}
        onRecover={onRecover}
        onEnterDemoMode={onEnterDemoMode}
      />
    );
  },
);

export interface WelcomeProps {
  onCreate(): void;
  // onZepeto(): void;
  onRecover(): void;
  onEnterDemoMode(): void;
}

export const Welcome = observer<WelcomeProps>(function Welcome({
  onCreate,
  // onZepeto,
  onRecover,
  onEnterDemoMode,
}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const intl = useIntl();
  const theme = useTheme();

  const accountPickerModalProps = useAccountPickerModalProps();

  return (
    <WelcomeLayout title={renderTitle()} subTitle={renderSubTitle()}>
      {theme.welcome.buttons.map((button) => {
        switch (button) {
          case WelcomeButton.Zepeto:
            return (
              <Button
                key={button}
                label="Login"
                flavor="primary"
                onPress={onRecover}
              />
            );
          // case WelcomeButton.Login:
          //   if (walletsStore.wallets.length === 0) return null;
          //   return (
          //     <Button
          //       key={button}
          //       label={intl.formatMessage({
          //         id: "onboarding1.login",
          //         defaultMessage: "Login",
          //       })}
          //       flavor="primary"
          //       onPress={() => {
          //         accountPickerModalProps.open();
          //       }}
          //     />
          //   );
          case WelcomeButton.GetStarted:
            return (
              <Button
                key={button}
                label="Sign Up"
                flavor="cancel"
                buttonStyle={{
                  marginTop: theme.spacing[4],
                }}
                onPress={onCreate}
              />
            );
          case WelcomeButton.RecoverWallet:
            return (
              <Button
                key={button}
                label={intl.formatMessage({ id: "onboarding1.recoverwallet" })}
                flavor="primary"
                buttonStyle={{
                  marginTop: theme.spacing[4],
                }}
                onPress={() => {
                  Alert.alert(
                    "Recover Existing Wallet",
                    "Only use this if you have made a wallet using the Obi app before.",
                    [
                      {
                        text: "Cancel",
                        style: "cancel",
                        // eslint-disable-next-line @typescript-eslint/no-empty-function
                        onPress() {},
                      },
                      {
                        text: "Continue",
                        onPress: onRecover,
                      },
                    ],
                  );
                }}
              />
            );
          case WelcomeButton.Demo:
            return (
              <Button
                key={button}
                label={intl.formatMessage({
                  id: "onboarding1.demo",
                  defaultMessage: "Enter Demo Mode",
                })}
                flavor="primary"
                buttonStyle={{
                  marginTop: theme.spacing[4],
                }}
                onPress={onEnterDemoMode}
              />
            );
          default:
            return null;
        }
      })}
      <AccountPickerModal {...accountPickerModalProps} />
    </WelcomeLayout>
  );

  function renderTitle() {
    return theme.i18n.welcome.title;
  }

  function renderSubTitle() {
    return theme.i18n.welcome.subTitle;
  }
});

/* const ZepetoButton = observer(function ZepetoButton({
  onPress,
}: {
  onPress?: () => void;
}) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: "white",
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        marginBottom: theme.welcome.buttonSpacing ?? theme.spacing[16],
        borderWidth: 3,
        borderColor: theme.colors.primary,
        borderRadius: theme.buttonFlavors.primary.borderRadius,
      }}
    >
      <Image
        source={{
          uri: "/zepeto-logo.png",
        }}
        style={{ width: 38, height: 38 }}
      />
      <View
        style={{
          marginLeft: 10,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 15,
            color: theme.colors.primary,
          }}
        >
          USE MY ZEPETO APP
        </Text>
      </View>
    </TouchableOpacity>
  );
}); */
