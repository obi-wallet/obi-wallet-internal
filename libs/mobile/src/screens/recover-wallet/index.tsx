import { useTheme } from "@emotion/react";
import {
  isCosmosChain,
  KeyType,
  MultisigKey,
  MultisigKeySerializedData,
} from "@obi-wallet/common";
import { CommonActions } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { View } from "react-native";
import invariant from "tiny-invariant";

import { handleCosmos } from "./cosmos";
import { handleTerra } from "./terra";
import { AsyncButton } from "../../app/button";
import { RootRoute, useRootNavigation } from "../../app/root-stack";
import {
  OnboardingRoute,
  OnboardingStackParamList,
} from "../../app/screens/onboarding/onboarding-stack";
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

          const chainId = draft.value.chain;
          try {
            if (isCosmosChain(chainId)) {
              await handleCosmos({
                draft,
                serializedData: params.serializedData,
                demoMode: params.demoMode,
                chainId,
              });
            } else {
              await handleTerra({
                draft,
                serializedData: params.serializedData,
                demoMode: params.demoMode,
              });
            }

            const wallet = params.demoMode
              ? await walletsStore.addMultisigDemoWallet(params.serializedData)
              : await walletsStore.addMultisigWallet(params.serializedData);
            await wallet.setOwner(draft.value);

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
            // noop
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
        onRecoverNfc={({ targetPublicKey }) => {
          navigation.navigate(KeyRoute.NfcKey, {
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
}

export const RecoverWallet = observer<RecoverWalletProps>(
  function RecoverWallet({
    draftId,
    onSubmit,
    onAddSocial,
    onAddNfc,
    onRecoverNfc,
  }) {
    const { draftsStore } = useStore();
    const draft = draftsStore.get<MultisigKey>({ id: draftId });

    const hasSocialKey = draft.value.hasKeyOfType(KeyType.Social);
    const nfcKey = draft.value.getKeyOfType(KeyType.Nfc);

    function getNfcKeyActions() {
      if (nfcKey) {
        if (MultisigKeySerializedData.isUsableKey(nfcKey)) {
          return {
            label: "Remove",
            onPress: () => {
              draft.value.removeNfcKey();
            },
          };
        } else {
          return {
            label: "Recover",
            onPress: () => {
              onRecoverNfc({
                targetPublicKey: nfcKey.payload.publicKey.value,
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
                  draft.value.removeSocialKey();
                },
              }
            : {
                label: "Add",
                onPress: onAddSocial,
              },
          [KeyType.Nfc]: getNfcKeyActions(),
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
