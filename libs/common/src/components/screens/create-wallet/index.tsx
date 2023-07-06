import { useTheme } from "@emotion/react";
import {
  KeyType,
  MultisigKey,
  ObservableFlexAccount,
  Sdk,
  generateSec256k1KeyPair,
} from "@obi-wallet/sdk";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { View } from "react-native";

import { useStore } from "../../../contexts";
import { Alert, setSessionKey } from "../../../helpers";
import {
  KeyFlow,
  KeyRoute,
  OnboardingRoute,
  OnboardingStackParamList,
  useRootNavigation,
} from "../../../router";
import { Draft } from "../../../stores";
import { Button } from "../../buttons";
import { MultisigSettings } from "../../multisig-settings";

export type CreateWalletScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  OnboardingRoute.CreateWallet
>;

export const CreateWalletScreen = observer<CreateWalletScreenProps>(
  function CreateWalletScreen({ route }) {
    const navigation = useRootNavigation();
    const theme = useTheme();
    const { params } = route;

    const { draftsStore, walletsStore } = useStore();
    const draft = draftsStore.get<MultisigKey>({
      id: params.draftId,
    });

    return (
      <CreateWallet
        {...params}
        onSubmit={async () => {
          const response = await walletsStore.createWallet({
            multisigKey: draft.value,
            demoMode: params.demoMode,
          });

          if (!response.approved) return;
          if (!response.payload.success) {
            console.log(response.payload.originalPayload);
            Alert.alert("Something went wrong", response.payload.description);
            return;
          }
          if (theme.loginModal) {
            const wallet = walletsStore.currentWallet;
            if (!wallet) {
              console.log("no wallet");
              return;
            }

            await setSessionKey({
              wallet,
              maxSpend: 5,
              isLogin: true,
            });
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
  const draft = draftsStore.get<MultisigKey>({ id: draftId });

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
        <Button flavor="primary" label="Create Wallet" onPress={onSubmit} />
      </View>
    </MultisigSettings>
  );
});
