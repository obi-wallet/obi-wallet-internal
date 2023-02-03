import { mockAction, MultisigDraft } from "../../src/fixture-helpers";
import { NfcKey } from "../../src/screens/keys/nfc";

export default (
  <MultisigDraft.Container>
    <NfcKey
      draftId={MultisigDraft.draftId}
      demoMode
      onSubmit={mockAction("onSubmit")}
    />
  </MultisigDraft.Container>
);
