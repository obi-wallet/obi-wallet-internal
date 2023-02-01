import { MultisigKey } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { ReactNode, useEffect } from "react";
import { Alert } from "react-native";

import { useStore } from "../app/stores";

export function mockAction(message: string) {
  return () => {
    Alert.alert(message);
  };
}

const multisigDraftId = "multisigSettingsFixture";
export const MultisigDraft = {
  draftId: multisigDraftId,
  Container: observer<{ children: ReactNode }>(function MultisigDraft({
    children,
  }) {
    const { draftsStore } = useStore();
    const draft = draftsStore.get({ id: multisigDraftId });

    useEffect(() => {
      if (!draft) {
        draftsStore.create({
          original: new MultisigKey(),
          id: multisigDraftId,
        });
      }
    }, [draft, draftsStore]);

    return draft ? <>{children}</> : null;
  }),
};
