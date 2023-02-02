import { Feature, MultisigKey } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useIntl } from "react-intl";
import { Alert } from "react-native";

import {
  AccountPickerModal,
  OnboardingRoute,
  OnboardingStackParamList,
  useAccountPickerModalProps,
  useRootNavigation,
  useStore,
} from "../..";
import { Button } from "../../app/button";
import GetStarted from "../../app/screens/onboarding/welcome/assets/get-started.svg";
import { WelcomeLayout } from "../../components/welcome-layout";
import { KeyFlow, KeyRoute } from "../keys";

export type WelcomeScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  OnboardingRoute.Welcome
>;

export const WelcomeScreen = observer<WelcomeScreenProps>(
  function WelcomeScreen() {
    const navigation = useRootNavigation();
    const { chainStore, draftsStore } = useStore();

    function onCreate() {
      const newMultisigKey = new MultisigKey({
        chain: chainStore.currentChain,
      });
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
      const newMultisigKey = new MultisigKey({
        chain: chainStore.currentChain,
      });
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
      const newMultisigKey = new MultisigKey({
        chain: chainStore.currentChain,
      });
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
  const isObi = configStore.isObi();
  const intl = useIntl();

  const accountPickerModalProps = useAccountPickerModalProps();

  return (
    <>
      <WelcomeLayout title={renderTitle()} subTitle={renderSubTitle()}>
        {walletsStore.readyWallets.length > 0 ? (
          <Button
            label={intl.formatMessage({
              id: "onboarding1.login",
              defaultMessage: "Login",
            })}
            RightIcon={isObi ? undefined : GetStarted}
            flavor="green"
            onPress={() => {
              accountPickerModalProps.open();
            }}
          />
        ) : null}
        <Button
          label={intl.formatMessage({ id: "onboarding1.getstarted" })}
          RightIcon={isObi ? undefined : GetStarted}
          flavor="green"
          style={{
            marginTop: 20,
          }}
          onPress={onCreate}
        />
        <Button
          label={intl.formatMessage({ id: "onboarding1.recoverwallet" })}
          RightIcon={isObi ? undefined : GetStarted}
          flavor="blue"
          style={{
            marginTop: 20,
          }}
          onPress={() => {
            Alert.alert(
              "Recover Existing Wallet",
              "Only use this if you have made a wallet using the Obi app before.",
              [
                {
                  text: "Cancel",
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
            RightIcon={isObi ? undefined : GetStarted}
            flavor="blue"
            style={{
              marginTop: 20,
            }}
            onPress={onEnterDemoMode}
          />
        ) : null}
      </WelcomeLayout>
      <AccountPickerModal {...accountPickerModalProps} />
    </>
  );

  function renderTitle() {
    if (isObi) {
      return intl.formatMessage({
        id: "onboarding1.welcometo.obi",
        defaultMessage: "Welcome to Obi",
      });
    } else {
      return intl.formatMessage({
        id: "onboarding1.welcometo.loop",
        defaultMessage: "Welcome to Loop",
      });
    }
  }

  function renderSubTitle() {
    if (isObi) {
      return "Obi is the most secure and convenient way to manage assets in the Cosmos.";
    } else {
      return intl.formatMessage({
        id: "onboarding1.welcomesubtext",
        defaultMessage:
          "Loop, powered by Obi, is the world's most powerful wallet for Web3.",
      });
    }
  }
});
