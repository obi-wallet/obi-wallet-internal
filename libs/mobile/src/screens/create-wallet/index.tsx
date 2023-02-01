import { KeyType, MultisigKey, WalletType } from "@obi-wallet/common";
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

    const { chainStore, configStore, draftsStore, walletsStore } = useStore();
    const draft = draftsStore.get<MultisigKey>({ id: params.draftId });

    return (
      <CreateWallet
        {...params}
        onSubmit={async () => {
          switch (configStore.getDefaultMultisigWalletType()) {
            case WalletType.CosmosMultisig:
              await handleCosmos({
                draft,
                chainStore,
                walletsStore,
                demoMode: params.demoMode,
              });
              break;
            case WalletType.TerraMultisig:
              await handleTerra({
                draft,
                chainStore,
                walletsStore,
                demoMode: params.demoMode,
              });
              break;
          }

          // TODO: instead: always all routes but reset when login state changes
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
      />
    );
  }
);

export interface CreateWalletProps {
  draftId: string;

  onSubmit(): void;
  onAddSocial(): void;
}

export const CreateWallet = observer<CreateWalletProps>(function CreateWallet({
  draftId,
  onSubmit,
  onAddSocial,
}) {
  return (
    <MultisigSettings
      draftId={draftId}
      title="Create Wallet"
      subTitle="Add keys to improve security."
      actions={{
        [KeyType.Social]: {
          label: "Add",
          onPress: onAddSocial,
        },
      }}
    >
      <View style={{ paddingTop: 10 }}>
        <Button flavor="blue" label="Create Wallet" onPress={onSubmit} />
      </View>
    </MultisigSettings>
  );
});
