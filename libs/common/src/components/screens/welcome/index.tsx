import { useTheme } from "@emotion/react";
import { Feature } from "@obi-wallet/config";
import { ObservableMultisigKey } from "@obi-wallet/sdk";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useIntl } from "react-intl";

import { WelcomeLayout } from "./layout";
import { useStore } from "../../../contexts";
import { Alert, isWeb } from "../../../helpers";
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

    function onCreate() {
      const newMultisigKey = ObservableMultisigKey.create(
        chainStore.currentChain
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
  const { configStore, walletsStore } = useStore();
  const intl = useIntl();
  const theme = useTheme();

  const accountPickerModalProps = useAccountPickerModalProps();

  return (
    <WelcomeLayout title={renderTitle()} subTitle={renderSubTitle()}>
      {walletsStore.wallets.length > 0 ? (
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
      ) : null}
      <Button
        label={intl.formatMessage({ id: "onboarding1.getstarted" })}
        flavor="primary"
        buttonStyle={{
          marginTop: theme.spacing[4],
        }}
        onPress={onCreate}
      />
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
      {configStore.isFeatureEnabled(Feature.DemoMode) ? (
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
      ) : null}
      <AccountPickerModal {...accountPickerModalProps} />
    </WelcomeLayout>
  );

  function renderTitle() {
    if (isWeb()) {
      return "Osmosis Smart Account";
    }
    return intl.formatMessage({
      id: "onboarding1.welcometo.obi",
      defaultMessage: "Welcome to Obi",
    });
  }

  function renderSubTitle() {
    if (isWeb()) {
      return "Welcome to the most secure and convenient way to manage your trading on Osmosis!";
    }

    return "Obi is the most secure and convenient way to manage assets in the Cosmos.";
  }
});
