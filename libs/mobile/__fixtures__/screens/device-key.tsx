import { MultisigKey } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { ReactNode, useEffect } from "react";
import { Alert } from "react-native";

import { useStore } from "../../src/app/stores";
import { DeviceKey } from "../../src/screens/keys/device";

// TODO: create hook for that
const draftId = "multisigSettingsFixture";

export const MultisigDraft = observer<{ children: ReactNode }>(
  function MultisigDraft({ children }) {
    const { draftsStore } = useStore();
    const draft = draftsStore.get({ id: draftId });

    useEffect(() => {
      if (!draft) {
        draftsStore.create({
          original: new MultisigKey(),
          id: draftId,
        });
      }
    }, [draft, draftsStore]);

    return draft ? <>{children}</> : null;
  }
);

function mockAction(message: string) {
  return () => {
    Alert.alert(message);
  };
}

export default (
  <MultisigDraft>
    <DeviceKey draftId={draftId} demoMode onSubmit={mockAction("onSubmit")} />
  </MultisigDraft>
);
