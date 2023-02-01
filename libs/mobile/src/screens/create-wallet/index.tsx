import { KeyType, MultisigKey, WalletType } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { View } from "react-native";

import { handleTerra } from "./terra";
import { Button } from "../../app/button";
import { useRootNavigation } from "../../app/root-stack";
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
          // TODO: Basically what we do in MultisigInit, but working with a draft
          // Create wallet after success
          // Then clean up all that stuff with currentAdmin vs. nextAdmin I guess

          switch (configStore.getDefaultMultisigWalletType()) {
            case WalletType.CosmosMultisig:
              // TODO:
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
