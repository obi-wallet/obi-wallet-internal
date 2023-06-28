import { useTheme } from "@emotion/react";
import { Feature } from "@obi-wallet/config";
import { MultisigKey, ObservableMultisigKey } from "@obi-wallet/sdk";
import { WelcomeButton } from "@obi-wallet/theme";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useIntl } from "react-intl";
import { Image, TouchableOpacity, View, Text } from "react-native";

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
    const { chainStore, draftsStore } = useStore();
    const theme = useTheme();

    function onCreate() {
      const newMultisigKey = ObservableMultisigKey.create(
        chainStore.currentChain
      );
      const draftId = draftsStore.create({
        original: newMultisigKey,
      });

      // Fake platform recovery key
      if (theme.ethereumBalances) {
        const draft = draftsStore.get<MultisigKey>({ id: draftId });
        draft.value.setSocialKey({
          type: "tendermint/PubKeySecp256k1",
          value: "A4TlI8UUTtpSI+oZ9q0dnXJoK9GiE/iMoy5cdMO2HNTI",
        });
      }

      navigation.navigate(KeyRoute.DeviceKey, {
        draftId,
        flow: KeyFlow.CreateWallet,
        demoMode: false,
      });
    }

    function onRecover() {
      const newMultisigKey = ObservableMultisigKey.create(
        chainStore.currentChain
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
        chainStore.currentChain
      );
      const draftId = draftsStore.create({
        original: newMultisigKey,
      });

      // Fake platform recovery key
      if (theme.ethereumBalances) {
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
        onRecover={onRecover}
        onEnterDemoMode={onEnterDemoMode}
      />
    );
  }
);

export interface WelcomeProps {
  onCreate(): void;

  onRecover(): void;

  onEnterDemoMode(): void;
}

export const Welcome = observer<WelcomeProps>(function Welcome({
  onCreate,
  onRecover,
  onEnterDemoMode,
}) {
  const { walletsStore } = useStore();
  const intl = useIntl();
  const theme = useTheme();

  const accountPickerModalProps = useAccountPickerModalProps();
  const allowedButtons = theme.welcome?.buttons ?? [];

  const getButtons = () => {
    const buttons = theme.welcome.buttons.map((button) => {
      switch (button) {
        case WelcomeButton.Zepeto:
          return <ZepetoButton />;
        case WelcomeButton.NewUser:
          return (
            <Button
              label="New User"
              flavor="primary"
              onPress={onEnterDemoMode}
            />
          );
        case WelcomeButton.Login:
          if (walletsStore.wallets.length === 0) return null;
          return (
            <Button
              label={intl.formatMessage({
                id: "onboarding1.login",
                defaultMessage: "Login",
              })}
              flavor="primary"
              onPress={() => {
                accountPickerModalProps.open();
              }}
            />
          );
        case WelcomeButton.Getstarted:
          return (
            <Button
              label={intl.formatMessage({ id: "onboarding1.getstarted" })}
              flavor="primary"
              buttonStyle={{
                marginTop: theme.spacing[4],
              }}
              onPress={onCreate}
            />
          );
        case WelcomeButton.Recoverwallet:
          return (
            <Button
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
                  ]
                );
              }}
            />
          );
        case WelcomeButton.Demo:
          return (
            <Button
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
    });
    return buttons;
  };

  return (
    <WelcomeLayout title={renderTitle()} subTitle={renderSubTitle()}>
      {getButtons()}
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

const ZepetoButton = observer(function ZepetoButton() {
  const theme = useTheme();
  return (
    <TouchableOpacity
      onPress={() => {
        console.log("Zepeto");
      }}
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
          USE MY ZEPETO DETAILS
        </Text>
        <Text
          style={{
            fontSize: 10,
            color: theme.colors.primary,
          }}
        >
          (Non-Custodial)
        </Text>
      </View>
    </TouchableOpacity>
  );
});
