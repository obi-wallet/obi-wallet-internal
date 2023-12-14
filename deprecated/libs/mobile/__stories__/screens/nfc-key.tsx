import { NfcKey } from "@obi-wallet/common";

import { mockAction, MultisigDraft } from "../../src/fixture-helpers";

export default (
  <MultisigDraft.Container>
    <NfcKey
      draftId={MultisigDraft.draftId}
      demoMode
      onSubmit={mockAction("onSubmit")}
    />
  </MultisigDraft.Container>
);
