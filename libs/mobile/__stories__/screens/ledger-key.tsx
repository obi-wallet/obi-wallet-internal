import { LedgerKey } from "@obi-wallet/common";

import { mockAction, MultisigDraft } from "../../src/fixture-helpers";

export default (
  <MultisigDraft.Container>
    <LedgerKey
      draftId={MultisigDraft.draftId}
      demoMode
      onSubmit={mockAction("onSubmit")}
    />
  </MultisigDraft.Container>
);
