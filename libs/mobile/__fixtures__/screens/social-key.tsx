import { MultisigKey } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { ReactNode, useEffect } from "react";
import { Alert } from "react-native";

import { useStore } from "../../src/app/stores";
import { KeyFlow } from "../../src/screens/keys";
import { PhoneKeyConfirmProps } from "../../src/screens/keys/phone";
import { SocialKey } from "../../src/screens/keys/social";

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

function renderFlavor(flow: PhoneKeyConfirmProps["flow"]) {
  return (
    <MultisigDraft>
      <SocialKey
        draftId={draftId}
        flow={flow}
        onSubmit={mockAction("onSubmit")}
      />
    </MultisigDraft>
  );
}

export default {
  [KeyFlow.CreateWallet]: renderFlavor(KeyFlow.CreateWallet),
  [KeyFlow.RecoverWallet]: renderFlavor(KeyFlow.RecoverWallet),
  [KeyFlow.ReplaceKey]: renderFlavor(KeyFlow.ReplaceKey),
};
