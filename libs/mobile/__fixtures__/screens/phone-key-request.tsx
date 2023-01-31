import { MultisigKey } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { ReactNode, useEffect } from "react";
import { Alert } from "react-native";

import { useStore } from "../../src/app/stores";
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

function renderFlavor(flavor: PhoneKeyRequestProps["flavor"]) {
  return (
    <MultisigDraft>
      <PhoneKeyRequest
        draftId={draftId}
        flavor={flavor}
        demoMode
        onSubmit={mockAction("onSubmit")}
      />
    </MultisigDraft>
  );
}

export default {
  recoverPhone: renderFlavor("recover-phone"),
  recoverOther: renderFlavor("recover-other"),
  create: renderFlavor("create"),
};
