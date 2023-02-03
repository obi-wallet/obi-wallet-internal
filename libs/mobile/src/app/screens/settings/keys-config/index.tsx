import { useTheme } from "@emotion/react";
import {
  isCosmosChain,
  KeyType,
  MultisigKey,
  Wallet,
} from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { View } from "react-native";

import { MultisigSettings } from "../../../../components/multisig-settings";
import { KeyFlow, KeyRoute } from "../../../../screens/keys";
import { AsyncButton, Button } from "../../../button";
import { useRootNavigation } from "../../../root-stack";
import { useMultisigWallet, useStore } from "../../../stores";
import { handleCosmos } from "./cosmos";
import { handleTerra } from "./terra";

function getMultisigSettingsDraftId(wallet: Wallet) {
  return `multisig-settings/${wallet.id}`;
}

export const KeysConfigScreen = observer(function KeysConfigScreen() {
  const { draftsStore } = useStore();
  const wallet = useMultisigWallet();
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

  if (!draft) return null;

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }} />
    );
  }

  // TODO: show banner if dirty
  // TODO: highlight changed keys

  return (
    <MultisigSettings
      draftId={draftId}
      title={intl.formatMessage({
        id: "settings.multisig.title",
        defaultMessage: "Manage Multisig",
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
        [KeyType.Social]: draft.value.hasKeyOfType(KeyType.Social)
          ? {
              label: "Remove",
              onPress: () => {
                draft.value.removeSocialKey();
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
      }}
    >
      {draft.isDirty ? (
        <View style={{ paddingTop: 10 }}>
          <AsyncButton
            flavor="blue"
            label="Confirm Changes"
            onPress={async () => {
              setLoading(true);
              const chainId = wallet.chain;
              try {
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
