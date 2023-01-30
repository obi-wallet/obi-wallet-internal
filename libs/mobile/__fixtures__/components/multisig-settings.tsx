import { MultisigKey } from "@obi-wallet/common";
import { useEffect } from "react";

import { useStore } from "../../src/app/stores";
import { MultisigSettings } from "../../src/components/multisig-settings";

const draftId = "multisigSettingsFixture";

export default function MultisigSettingsFixture() {
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

  if (!draft) return null;

  return <MultisigSettings draftId={draftId} />;
}
