import { CloudKey } from "@obi-wallet/common";

import { mockAction, MultisigDraft } from "../../src/fixture-helpers";

export default (
  <MultisigDraft.Container>
    <CloudKey
      draftId={MultisigDraft.draftId}
      demoMode
      onSubmit={mockAction("onSubmit")}
    />
  </MultisigDraft.Container>
);
