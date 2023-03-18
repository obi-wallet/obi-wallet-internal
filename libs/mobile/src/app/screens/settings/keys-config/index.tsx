import { useTheme } from "@emotion/react";
import { Wallet } from "@obi-wallet/common";
import { isCosmosChain, KeyType, ObservableMultisigKey } from "@obi-wallet/sdk";
import { useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { View } from "react-native";

import { handleCosmos } from "./cosmos";
import { handleTerra } from "./terra";
import { MultisigSettings } from "../../../../components/multisig-settings";
import { getCodeIdsQuery } from "../../../../queries/user-account";
import { KeyFlow, KeyRoute } from "../../../../screens/keys";
import { AsyncButton, Button } from "../../../button";
import { useRootNavigation } from "../../../root-stack";
import { useMultisigWallet, useStore } from "../../../stores";

function getMultisigSettingsDraftId(wallet: Wallet) {
  return `multisig-settings/${wallet.id}`;
}

export const KeysConfigScreen = observer(function KeysConfigScreen() {
  const { draftsStore } = useStore();
  const wallet = useMultisigWallet();
  const navigation = useRootNavigation();
  const intl = useIntl();
  const queryClient = useQueryClient();

  const draftId = getMultisigSettingsDraftId(wallet);
  const draft = draftsStore.get<ObservableMultisigKey>({ id: draftId });

  useEffect(() => {
    if (!draft) {
      draftsStore.create({
        id: draftId,
        original: wallet.owner,
      });
    }
  }, [draft, draftId, draftsStore, wallet.owner]);

  useEffect(() => {
    if (draft && !draft.original.equals(wallet.owner)) {
      draft.commit({ original: wallet.owner });
    }
  });

  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  if (!draft || loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }} />
    );
  }

  // TODO: show banner if dirty
  // TODO: highlight changed keys

  const hasSocialKey = draft.value.hasKeyOfType(KeyType.Social);
  const hasNfcKey = draft.value.hasKeyOfType(KeyType.Nfc);
  const hasCloudKey = draft.value.hasKeyOfType(KeyType.Cloud);

  return (
    <MultisigSettings
      draftId={draftId}
      title={intl.formatMessage({
        id: "settings.multisig.title",
        defaultMessage: "Manage Multi-Key",
      })}
      subTitle={intl.formatMessage({
        id: "settings.multisig.subtitle",
        defaultMessage:
          "Add/edit keys to improve security. Tap on any of the following",
      })}
      actions={{
        [KeyType.Phone]: {
          label: "Replace",
          onPress: () => {
            navigation.navigate(KeyRoute.PhoneKeyRequest, {
              draftId,
              flow: KeyFlow.EditWallet,
              demoMode: wallet.isDemo,
            });
          },
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
              onPress: () => {
                navigation.navigate(KeyRoute.SocialKey, {
                  draftId,
                  flow: KeyFlow.EditWallet,
                  demoMode: wallet.isDemo,
                });
              },
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
              onPress: () => {
                navigation.navigate(KeyRoute.NfcKey, {
                  draftId,
                  flow: KeyFlow.EditWallet,
                  demoMode: wallet.isDemo,
                });
              },
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
              onPress: () => {
                navigation.navigate(KeyRoute.CloudKey, {
                  draftId,
                  flow: KeyFlow.EditWallet,
                  demoMode: wallet.isDemo,
                });
              },
            },
        [KeyType.Email]: draft.value.hasKeyOfType(KeyType.Email)
          ? {
              label: "Remove",
              onPress: () => {
                draft.value.removeKeyOfType(KeyType.Email);
              },
            }
          : {
              label: "Add",
              onPress: () => {
                navigation.navigate(KeyRoute.EmailKey, {
                  draftId,
                  flow: KeyFlow.EditWallet,
                  demoMode: wallet.isDemo,
                });
              },
            },
      }}
    >
      {draft.isDirty ? (
        <View style={{ paddingTop: 10 }}>
          <AsyncButton
            flavor="blue"
            label="Confirm Changes"
            onPress={async () => {
              setLoading(true);
              const chainId = wallet.chainId;
              try {
                const codeIds = await queryClient.fetchQuery(
                  getCodeIdsQuery({
                    chainId,
                    address: wallet.proxyAddress,
                  })
                );

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
                    codeIds,
                  });
                }
              } catch (e) {
                // noop
              } finally {
                setLoading(false);
              }
            }}
          />
          <Button
            flavor="cancel"
            label="Cancel"
            onPress={() => {
              draft.reset();
            }}
          />
        </View>
      ) : null}
    </MultisigSettings>
  );
});
