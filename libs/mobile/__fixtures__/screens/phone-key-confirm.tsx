import { MultisigKey } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { ReactNode, useEffect } from "react";

import { useStore } from "../../src/app/stores";
import {
  PhoneKeyConfirm,
  PhoneKeyConfirmProps,
} from "../../src/screens/keys/phone";

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

function renderFlavor(flavor: PhoneKeyConfirmProps["flavor"]) {
  return (
    <MultisigDraft>
      <PhoneKeyConfirm
        draftId={draftId}
        flavor={flavor}
        demoMode
        phoneNumber="123"
        securityAnswer="foo"
        securityQuestion="bar"
      />
    </MultisigDraft>
  );
}

export default {
  recoverPhone: renderFlavor("recover-phone"),
  recoverOther: renderFlavor("recover-other"),
  create: renderFlavor("create"),
};
