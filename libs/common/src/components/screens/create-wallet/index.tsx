import { useTheme } from "@emotion/react";
import {
  KeyType,
  MultisigKey,
  getOrCreateDeviceKeyPair,
} from "@obi-wallet/sdk";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { View } from "react-native";
import invariant from "tiny-invariant";

import { useStore } from "../../../contexts";
import { Alert } from "../../../helpers";
import {
  KeyFlow,
  KeyRoute,
  OnboardingRoute,
  OnboardingStackParamList,
  useRootNavigation,
} from "../../../router";
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

          let wallet;
          if (theme.loginModal) {
            wallet = walletsStore.currentWallet;
            if (!wallet) {
              console.log("no wallet");
              return;
            } else {
              wallet.setEvmSigningAddress(deviceKey?.privateKey);
            }
          }
        }}
        onAddZAuth={() => {
          navigation.navigate(KeyRoute.ZAuthKey, {
            ...params,
            flow: KeyFlow.CreateWallet,
          });
        }}
        onAddPhone={() => {
          navigation.navigate(KeyRoute.PhoneKeyRequest, {
            ...params,
            flow: KeyFlow.CreateWallet,
          });
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
  },
);

export interface CreateWalletProps {
  draftId: string;

  onSubmit(): void;
  onAddZAuth(): void;
  onAddPhone(): void;
  onAddSocial(): void;
  onAddNfc(): void;
  onAddCloud(): void;
  onAddEmail(): void;
}

export const CreateWallet = observer<CreateWalletProps>(function CreateWallet({
  draftId,
  onSubmit,
  onAddZAuth,
  onAddPhone,
  onAddNfc,
  onAddSocial,
  onAddCloud,
  onAddEmail,
}) {
  const { draftsStore } = useStore();
  const draft = draftsStore.get<MultisigKey>({ id: draftId });

  const hasZAuthKey = draft.value.hasKeyOfType(KeyType.ZAuth);
  const hasPhoneKey = draft.value.hasKeyOfType(KeyType.Phone);
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
        [KeyType.ZAuth]: hasZAuthKey
          ? {
              label: "Remove",
              onPress: () => {
                draft.value.removeKeyOfType(KeyType.ZAuth);
              },
            }
          : {
              label: "Add",
              onPress: onAddZAuth,
            },
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
        [KeyType.Phone]: hasPhoneKey
          ? {
              label: "Remove",
              onPress: () => {
                draft.value.removeKeyOfType(KeyType.Phone);
              },
            }
          : {
              label: "Add",
              onPress: onAddPhone,
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
