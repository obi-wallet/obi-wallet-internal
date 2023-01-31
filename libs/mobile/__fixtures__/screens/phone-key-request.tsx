import { MultisigKey } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { ReactNode, useEffect } from "react";
import { Alert } from "react-native";

import { useStore } from "../../src/app/stores";
import { KeyFlow } from "../../src/screens/keys";
import {
  PhoneKeyRequest,
  PhoneKeyRequestProps,
} from "../../src/screens/keys/phone";

// TODO: create hook for that
const draftId = "multisigSettingsFixture";

const MultisigDraft = observer<{ children: ReactNode }>(function MultisigDraft({
  children,
}) {
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
});

function mockAction(message: string) {
  return () => {
    Alert.alert(message);
  };
}

function renderFlavor(flow: PhoneKeyRequestProps["flow"]) {
  return (
    <MultisigDraft>
      <PhoneKeyRequest
        draftId={draftId}
        flow={flow}
        demoMode
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
