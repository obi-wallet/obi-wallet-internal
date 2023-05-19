import { KeyFlow, KeyRoute, useStore, Welcome } from "@obi-wallet/common";
import { ObservableMultisigKey } from "@obi-wallet/sdk";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";

import {
  OnboardingRoute,
  OnboardingStackParamList,
  useRootNavigation,
} from "../..";

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
