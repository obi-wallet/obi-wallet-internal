import { isCosmosChain, KeyType, MultisigKey } from "@obi-wallet/common";
import { CommonActions } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { View } from "react-native";

import { handleCosmos } from "./cosmos";
import { handleTerra } from "./terra";
import { Button } from "../../app/button";
import { RootRoute, useRootNavigation } from "../../app/root-stack";
import {
  OnboardingRoute,
  OnboardingStackParamList,
} from "../../app/screens/onboarding/onboarding-stack";
import { useStore } from "../../app/stores";
import { MultisigSettings } from "../../components/multisig-settings";
import { KeyFlow, KeyRoute } from "../keys";

export type CreateWalletScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  OnboardingRoute.CreateWallet
>;

export const CreateWalletScreen = observer<CreateWalletScreenProps>(
  function CreateWalletScreen({ route }) {
    const navigation = useRootNavigation();
    const { params } = route;

    const { draftsStore, walletsStore } = useStore();
    const draft = draftsStore.get<MultisigKey>({ id: params.draftId });

    return (
      <CreateWallet
        {...params}
        onSubmit={async () => {
          const chainId = draft.value.chain;
          if (isCosmosChain(chainId)) {
            await handleCosmos({
              draft,
              walletsStore,
              demoMode: params.demoMode,
              chainId,
            });
          } else {
            await handleTerra({
              draft,
              walletsStore,
              demoMode: params.demoMode,
              chainId,
            });
          }

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
            flow: KeyFlow.CreateWallet,
          });
        }}
        onAddNfc={() => {
          navigation.navigate(KeyRoute.NfcKey, {
            ...params,
            flow: KeyFlow.CreateWallet,
          });
        }}
      />
    );
  }
);

export interface CreateWalletProps {
  draftId: string;

  onSubmit(): void;
  onAddSocial(): void;
  onAddNfc(): void;
}

export const CreateWallet = observer<CreateWalletProps>(function CreateWallet({
  draftId,
  onSubmit,
  onAddNfc,
  onAddSocial,
}) {
  const { draftsStore } = useStore();
  const draft = draftsStore.get<MultisigKey>({ id: draftId });

  const hasSocialKey = draft.value.hasKeyOfType(KeyType.Social);
  const hasNfcKey = draft.value.hasKeyOfType(KeyType.Nfc);

  return (
    <MultisigSettings
      draftId={draftId}
      title="Create Wallet"
      subTitle="Add keys to improve security."
      actions={{
        [KeyType.Social]: hasSocialKey
          ? {
              label: "Remove",
              onPress: () => {
                draft.value.removeSocialKey();
              },
            }
          : {
              label: "Add",
              onPress: onAddSocial,
            },
        [KeyType.Nfc]: hasNfcKey
          ? {
              label: "Remove",
              onPress: () => {
                draft.value.removeNfcKey();
              },
            }
          : {
              label: "Add",
              onPress: onAddNfc,
            },
      }}
    >
      <View style={{ paddingTop: 10 }}>
        <Button flavor="blue" label="Create Wallet" onPress={onSubmit} />
      </View>
    </MultisigSettings>
  );
});
