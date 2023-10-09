import { useTheme } from "@emotion/react";
import { KeyType, MultisigKey } from "@obi-wallet/sdk";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { View } from "react-native";
import { Modal } from "react-native";

import { useStore } from "../../../contexts";
import {
  KeyFlow,
  KeyRoute,
  OnboardingRoute,
  OnboardingStackParamList,
  useRootNavigation,
} from "../../../router";
import { Button } from "../../buttons";
import { SpinnerIcon } from "../../icons/spinner-icon";
import { MultisigSettings } from "../../multisig-settings";
import { Text } from "../../typography";

export type CreateWalletScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  OnboardingRoute.CreateWallet
>;

export const CreateWalletScreen = observer<CreateWalletScreenProps>(
  function CreateWalletScreen({ route }) {
    const navigation = useRootNavigation();
    const theme = useTheme();
    const { params } = route;
    const [loading, setLoading] = useState(false);
    const { draftsStore, walletsStore } = useStore();

    const draft = draftsStore.get<MultisigKey>({
      id: params.draftId,
    });

    return (
      <CreateWallet
        {...params}
        loading={loading}
        onSubmit={async () => {
          // console.log("draft value is " + JSON.stringify(draft.value));
          setLoading(true);
          console.log(
            !draft.value.setupDetails?.evmUserContractAddress,
            "while?",
          );
          while (!draft.value.setupDetails?.evmUserContractAddress) {
            await new Promise((resolve) => {
              console.log("waiting");
              setTimeout(resolve, 1_000);
            });
          }
          console.log("go ahead");
          let response;
          try {
            response = await walletsStore.createWallet({
              multisigKey: draft.value,
              demoMode: params.demoMode,
            });
          } catch (e) {
            console.log("Retrying after error: " + JSON.stringify(e));
            response = await walletsStore.createWallet({
              multisigKey: draft.value,
              demoMode: params.demoMode,
            });
          }
          console.log("wallet received: " + JSON.stringify(response));

          let wallet;
          if (theme.loginModal) {
            wallet = walletsStore.currentWallet;
            if (!wallet) {
              console.log("no wallet");
              return;
            } else {
              //wallet.setEvmSigningAddress(deviceKey?.privateKey);
            }
          }
          setLoading(false);
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
        onAddTelegram={() => {
          console.log("onAddTelegram");
          navigation.navigate(KeyRoute.TelegramKeyRequest, {
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
  loading: boolean;
  onSubmit(): void;
  onAddZAuth(): void;
  onAddPhone(): void;
  onAddSocial(): void;
  onAddNfc(): void;
  onAddCloud(): void;
  onAddEmail(): void;
  onAddTelegram(): void;
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
  onAddTelegram,
  loading,
}) {
  const { draftsStore } = useStore();
  const draft = draftsStore.get<MultisigKey>({ id: draftId });

  const hasZAuthKey = draft.value.hasKeyOfType(KeyType.ZAuth);
  const hasPhoneKey = draft.value.hasKeyOfType(KeyType.Phone);
  const hasTelegramKey = draft.value.hasKeyOfType(KeyType.Telegram);
  const hasSocialKey = draft.value.hasKeyOfType(KeyType.Social);
  const hasNfcKey = draft.value.hasKeyOfType(KeyType.Nfc);
  const hasCloudKey = draft.value.hasKeyOfType(KeyType.Cloud);
  const hasEmailKey = draft.value.hasKeyOfType(KeyType.Email);
  const theme = useTheme();
  console.log(draft.value);
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
        [KeyType.Telegram]: hasTelegramKey
          ? {
              label: "Remove",
              onPress: () => {
                draft.value.removeKeyOfType(KeyType.Telegram);
              },
            }
          : {
              label: "Add",
              onPress: onAddTelegram,
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
      <Modal
        transparent
        visible={loading && !draft.value.evmUserContractAddress}
      >
        <View
          style={{
            width: 375,
            height: 750,

            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
        >
          <View
            style={{
              position: "absolute",
              backgroundColor: theme.background.color,
              opacity: 0.8,
              width: "100%",
              height: "100%",
            }}
          />
          <SpinnerIcon />
          <View>
            <Text style={{ color: "white", marginTop: 20 }}>Loading</Text>
          </View>
        </View>
      </Modal>
      <View style={{ paddingTop: 10 }}>
        <Button flavor="primary" label="Create Wallet" onPress={onSubmit} />
      </View>
    </MultisigSettings>
  );
});
