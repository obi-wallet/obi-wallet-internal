import { useTheme } from "@emotion/react";
import { useCurrentWallet } from "@obi-wallet/headless-ui";
import { KeyType, MultisigKey, MultisigWallet } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { View } from "react-native";
import invariant from "tiny-invariant";

import { useStore } from "../../../../contexts";
import { Alert } from "../../../../helpers";
import { KeyFlow, KeyRoute, useRootNavigation } from "../../../../router";
import { AsyncButton, Button } from "../../../buttons";
import { MultisigSettings } from "../../../multisig-settings";

function getMultisigSettingsDraftId(wallet: MultisigWallet) {
  return `multisig-settings/${wallet.id}`;
}

export const MultisigSettingsScreen = observer(
  function MultisigSettingsScreen() {
    const { draftsStore } = useStore();
    const wallet = useCurrentWallet();
    const navigation = useRootNavigation();
    const intl = useIntl();

    const draftId = getMultisigSettingsDraftId(wallet);
    const draft = draftsStore.get<MultisigKey>({ id: draftId });

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
          defaultMessage: "Key Management",
        })}
        subTitle={intl.formatMessage({
          id: "settings.multisig.subtitle",
          defaultMessage:
            "Add/edit keys to improve security. Tap on any of the following",
        })}
        actions={{
          [KeyType.Phone]: {
            label: theme.style === "ztx" ? "Update" : "Replace",
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
              flavor="primary"
              label="Confirm Changes"
              onPress={async () => {
                setLoading(true);
                try {
                  invariant(
                    draft.value.evmSigningAddress,
                    "no evm signing address in draft",
                  );
                  const response = await wallet.updateOwner(
                    draft.value,
                    draft.value.evmSigningAddress,
                    draft.value.evmUserContractAddress,
                  );
                  if (response.approved && !response.payload.success) {
                    Alert.alert(
                      "Updating owner failed",
                      response.payload.rawLog,
                    );
                  }
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
  },
);
