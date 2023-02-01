import { isCosmosChain, KeyType, MultisigKey } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useIntl } from "react-intl";
import { View } from "react-native";

import { MultisigSettings } from "../../../../components/multisig-settings";
import { KeyFlow, KeyRoute } from "../../../../screens/keys";
import { Button } from "../../../button";
import { useRootNavigation } from "../../../root-stack";
import { useMultisigWallet, useStore } from "../../../stores";
import { handleTerra } from "./terra";

export const KeysConfigScreen = observer(function KeysConfigScreen() {
  const { draftsStore } = useStore();
  const wallet = useMultisigWallet();
  const navigation = useRootNavigation();
  const intl = useIntl();

  const draftId = `multisig-settings/${wallet.id}`;
  const draft = draftsStore.get<MultisigKey>({ id: draftId });

  useEffect(() => {
    if (!draft) {
      draftsStore.create({
        id: draftId,
        original: wallet.owner,
      });
    }
  }, [draft, draftId, draftsStore, wallet.owner]);

  if (!draft) return null;

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
              flow: KeyFlow.ReplaceKey,
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
                  flow: KeyFlow.ReplaceKey,
                  demoMode: wallet.isDemo,
                });
              },
            },
      }}
    >
      {draft.isDirty ? (
        <View style={{ paddingTop: 10 }}>
          <Button
            flavor="blue"
            label="Confirm Changes"
            onPress={async () => {
              await handleTerra({
                draft,
                wallet,
              });
              console.log("Confirm");
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
