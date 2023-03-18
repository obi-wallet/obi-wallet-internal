import { MultisigWalletSerializedData } from "@obi-wallet/common";
import { Chain, KeyType, ObservableMultisigKey } from "@obi-wallet/sdk";
import { CommonActions } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { Alert, View } from "react-native";

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
    const draft = draftsStore.get<ObservableMultisigKey>({
      id: params.draftId,
    });

    return (
      <CreateWallet
        {...params}
        onSubmit={async () => {
          const chainId = draft.value.chain;

          try {
            const serializedData = await Chain.select<
              Promise<MultisigWalletSerializedData.SerializedMultisigWalletData>
            >({
              chainId,
              onCosmosChain(chainId) {
                return handleCosmos({
                  draft,
                  demoMode: params.demoMode,
                  chainId,
                });
              },
              onTerraChain(chainId) {
                return handleTerra({
                  draft,
                  demoMode: params.demoMode,
                  chainId,
                });
              },
            });

            if (params.demoMode) {
              await walletsStore.addMultisigDemoWallet(serializedData);
            } else {
              await walletsStore.addMultisigWallet(serializedData);
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
          } catch (e) {
            const error = e as Error;
            Alert.alert("Something went wrong", error.message);
          }
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
        onAddCloud={() => {
          navigation.navigate(KeyRoute.CloudKey, {
            ...params,
            flow: KeyFlow.CreateWallet,
          });
        }}
        onAddEmail={() => {
          navigation.navigate(KeyRoute.EmailKey, {
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
  onAddCloud(): void;
  onAddEmail(): void;
}

export const CreateWallet = observer<CreateWalletProps>(function CreateWallet({
  draftId,
  onSubmit,
  onAddNfc,
  onAddSocial,
  onAddCloud,
  onAddEmail,
}) {
  const { draftsStore } = useStore();
  const draft = draftsStore.get<ObservableMultisigKey>({ id: draftId });

  const hasSocialKey = draft.value.hasKeyOfType(KeyType.Social);
  const hasNfcKey = draft.value.hasKeyOfType(KeyType.Nfc);
  const hasCloudKey = draft.value.hasKeyOfType(KeyType.Cloud);
  const hasEmailKey = draft.value.hasKeyOfType(KeyType.Email);

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
                draft.value.removeKeyOfType(KeyType.Social);
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
                draft.value.removeKeyOfType(KeyType.Nfc);
              },
            }
          : {
              label: "Add",
              onPress: onAddNfc,
            },
        [KeyType.Cloud]: hasCloudKey
          ? {
              label: "Remove",
              onPress: () => {
                draft.value.removeKeyOfType(KeyType.Cloud);
              },
            }
          : {
              label: "Add",
              onPress: onAddCloud,
            },
        [KeyType.Email]: hasEmailKey
          ? {
              label: "Remove",
              onPress: () => {
                draft.value.removeKeyOfType(KeyType.Email);
              },
            }
          : {
              label: "Add",
              onPress: onAddEmail,
            },
      }}
    >
      <View style={{ paddingTop: 10 }}>
        <Button flavor="blue" label="Create Wallet" onPress={onSubmit} />
      </View>
    </MultisigSettings>
  );
});
