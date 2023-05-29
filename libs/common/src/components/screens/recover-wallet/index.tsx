import { useTheme } from "@emotion/react";
import { KeyType, MultisigKey } from "@obi-wallet/sdk";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useState } from "react";
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
import { AsyncButton } from "../../buttons";
import { MultisigSettings } from "../../multisig-settings";

export type RecoverWalletScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  OnboardingRoute.RecoverWallet
>;

export const RecoverWalletScreen = observer<RecoverWalletScreenProps>(
  function RecoverWalletScreen({ route }) {
    const navigation = useRootNavigation();
    const { params } = route;

    const { draftsStore, walletsStore } = useStore();
    const draft = draftsStore.get<MultisigKey>({
      id: params.draftId,
    });

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

          try {
            const response = await walletsStore.recoverWallet({
              serializedData: params.serializedData,
              newOwner: draft.value,
            });
            if (!response.approved) return;
            if (!response.payload.success) {
              console.log(response.payload.rawLog);
              Alert.alert("Something went wrong", response.payload.rawLog);
              return;
            }
          } finally {
            setLoading(false);
          }
        }}
        onAddSocial={() => {
          navigation.navigate(KeyRoute.SocialKey, {
            ...params,
            flow: KeyFlow.RecoverWallet,
          });
        }}
        onAddNfc={() => {
          navigation.navigate(KeyRoute.NfcKey, {
            ...params,
            flow: KeyFlow.RecoverWallet,
          });
        }}
        onAddEmail={() => {
          navigation.navigate(KeyRoute.EmailKey, {
            ...params,
            flow: KeyFlow.RecoverWallet,
          });
        }}
        onRecoverNfc={({ targetPublicKey }) => {
          navigation.navigate(KeyRoute.NfcKey, {
            ...params,
            flow: KeyFlow.RecoverWallet,
            targetPublicKey,
          });
        }}
        onAddCloud={() => {
          navigation.navigate(KeyRoute.CloudKey, {
            ...params,
            flow: KeyFlow.RecoverWallet,
          });
        }}
        onRecoverCloud={({ targetPublicKey }) => {
          navigation.navigate(KeyRoute.CloudKey, {
            ...params,
            flow: KeyFlow.RecoverWallet,
            targetPublicKey,
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
  onAddNfc(): void;
  onRecoverNfc(payload: { targetPublicKey: string }): void;
  onAddCloud(): void;
  onRecoverCloud(payload: { targetPublicKey: string }): void;
  onAddEmail(): void;
}

export const RecoverWallet = observer<RecoverWalletProps>(
  function RecoverWallet({
    draftId,
    onSubmit,
    onAddSocial,
    onAddNfc,
    onRecoverNfc,
    onAddCloud,
    onRecoverCloud,
    onAddEmail,
  }) {
    const { draftsStore } = useStore();
    const draft = draftsStore.get<MultisigKey>({ id: draftId });

    const hasSocialKey = draft.value.hasKeyOfType(KeyType.Social);
    const hasEmailKey = draft.value.hasKeyOfType(KeyType.Email);

    const nfcKey = draft.value.getKeyOfType(KeyType.Nfc);
    const cloudKey = draft.value.getKeyOfType(KeyType.Cloud);

    function getNfcKeyActions() {
      if (nfcKey) {
        if (nfcKey.isUsable) {
          return {
            label: "Remove",
            onPress: () => {
              draft.value.removeKeyOfType(KeyType.Nfc);
            },
          };
        } else {
          return {
            label: "Recover",
            onPress: () => {
              onRecoverNfc({
                targetPublicKey: nfcKey.publicKey.value,
              });
            },
          };
        }
      } else {
        return {
          label: "Add",
          onPress: onAddNfc,
        };
      }
    }

    function getCloudKeyActions() {
      if (cloudKey) {
        if (cloudKey.isUsable) {
          return {
            label: "Remove",
            onPress: () => {
              draft.value.removeKeyOfType(KeyType.Cloud);
            },
          };
        } else {
          return {
            label: "Recover",
            onPress: () => {
              onRecoverCloud({
                targetPublicKey: cloudKey.publicKey.value,
              });
            },
          };
        }
      } else {
        return {
          label: "Add",
          onPress: onAddCloud,
        };
      }
    }

    return (
      <MultisigSettings
        draftId={draftId}
        title="Recover Wallet"
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
          [KeyType.Nfc]: getNfcKeyActions(),
          [KeyType.Cloud]: getCloudKeyActions(),
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
