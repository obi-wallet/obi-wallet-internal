import { mockAction, MultisigDraft } from "../../src/fixture-helpers";
import { CloudKey } from "../../src/screens/keys/cloud";

export default (
  <MultisigDraft.Container>
    <CloudKey
      draftId={MultisigDraft.draftId}
      demoMode
      onSubmit={mockAction("onSubmit")}
    />
  </MultisigDraft.Container>
);
