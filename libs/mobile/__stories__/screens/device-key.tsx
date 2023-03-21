import { mockAction, MultisigDraft } from "../../src/fixture-helpers";
import { DeviceKey } from "../../src/screens/keys/device";

export default (
  <MultisigDraft.Container>
    <DeviceKey
      draftId={MultisigDraft.draftId}
      demoMode
      onSubmit={mockAction("onSubmit")}
    />
  </MultisigDraft.Container>
);
