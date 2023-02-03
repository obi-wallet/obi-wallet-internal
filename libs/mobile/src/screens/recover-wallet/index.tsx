import { useTheme } from "@emotion/react";
import { isCosmosChain, KeyType, MultisigKey } from "@obi-wallet/common";
import { CommonActions } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { View } from "react-native";
import invariant from "tiny-invariant";

import { AsyncButton } from "../../app/button";
import { RootRoute, useRootNavigation } from "../../app/root-stack";
import {
  OnboardingRoute,
  OnboardingStackParamList,
} from "../../app/screens/onboarding/onboarding-stack";
import { handleCosmos } from "../../app/screens/settings/keys-config/cosmos";
import { handleTerra } from "../../app/screens/settings/keys-config/terra";
import { useStore } from "../../app/stores";
import { MultisigSettings } from "../../components/multisig-settings";
import { KeyFlow, KeyRoute } from "../keys";

export type RecoverWalletScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  OnboardingRoute.RecoverWallet
>;

export const RecoverWalletScreen = observer<RecoverWalletScreenProps>(
  function RecoverWalletScreen({ route }) {
    const navigation = useRootNavigation();
    const { params } = route;

    const { draftsStore, walletsStore } = useStore();
    const draft = draftsStore.get<MultisigKey>({ id: params.draftId });

    const [loading, setLoading] = useState(false);
    const theme = useTheme();

    if (!draft) return null;

    if (loading) {
      return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }} />
      );
    }

    return (
      <RecoverWallet
        {...params}
        onSubmit={async () => {
          setLoading(true);

          invariant(params.serializedData, "Missing serializedData param.");

          const wallet = params.demoMode
            ? await walletsStore.addMultisigDemoWallet(params.serializedData)
            : await walletsStore.addMultisigWallet(params.serializedData);

          const chainId = draft.value.chain;
          try {
            if (isCosmosChain(chainId)) {
              await handleCosmos({
                draft,
                wallet,
                chainId,
              });
            } else {
              await handleTerra({
                draft,
                wallet,
              });
            }
          } catch (e) {
            // noop
          } finally {
            setLoading(false);
          }

          await walletsStore.setCurrentWallet(wallet.id);
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: RootRoute.Home,
                },
              ],
            })
          );
        }}
        onAddSocial={() => {
          navigation.navigate(KeyRoute.SocialKey, {
            ...params,
            flow: KeyFlow.RecoverWallet,
          });
        }}
      />
    );
  }
);

export interface RecoverWalletProps {
  draftId: string;

  onSubmit(): Promise<void>;
  onAddSocial(): void;
}

export const RecoverWallet = observer<RecoverWalletProps>(
  function RecoverWallet({ draftId, onSubmit, onAddSocial }) {
    return (
      <MultisigSettings
        draftId={draftId}
        title="Recover Wallet"
        subTitle="Add keys to improve security."
        actions={{
          [KeyType.Social]: {
            label: "Add",
            onPress: onAddSocial,
          },
        }}
      >
        <View style={{ paddingTop: 10 }}>
          <AsyncButton
            flavor="blue"
            label="Recover Wallet"
            onPress={onSubmit}
          />
        </View>
      </MultisigSettings>
    );
  }
);
