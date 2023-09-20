import { useTheme } from "@emotion/react";
import { MultisigKey, ObservableMultisigKey } from "@obi-wallet/sdk";
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

export type WelcomeScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  OnboardingRoute.Welcome
>;

export const WelcomeScreen = observer<WelcomeScreenProps>(
  function WelcomeScreen() {
    const navigation = useRootNavigation();
    const { chainStore, configStore, draftsStore } = useStore();

    function onCreate() {
      const newMultisigKey = ObservableMultisigKey.create(
        chainStore.currentChain,
      );
      const draftId = draftsStore.create({
        original: newMultisigKey,
      });
      navigation.navigate(KeyRoute.DeviceKey, {
        draftId,
        flow: KeyFlow.CreateWallet,
        demoMode: false,
      });
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

    function onRecover() {
      const newMultisigKey = ObservableMultisigKey.create(
        chainStore.currentChain,
      );
      const draftId = draftsStore.create({
        original: newMultisigKey,
      });
      navigation.navigate(KeyRoute.DeviceKey, {
        draftId,
        flow: KeyFlow.RecoverWallet,
        demoMode: false,
      });
    }

    function onEnterDemoMode() {
      const newMultisigKey = ObservableMultisigKey.create(
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
  const { walletsStore } = useStore();
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
                // onPress={onZepeto}
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
