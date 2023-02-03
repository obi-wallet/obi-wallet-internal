import { mockAction, MultisigDraft } from "../../src/fixture-helpers";
import { KeyFlow } from "../../src/screens/keys";
import { PhoneKeyConfirmProps } from "../../src/screens/keys/phone";
import { SocialKey } from "../../src/screens/keys/social";

function renderFlavor(flow: PhoneKeyConfirmProps["flow"]) {
  return (
    <MultisigDraft.Container>
      <SocialKey
        draftId={MultisigDraft.draftId}
        flow={flow}
        onSubmit={mockAction("onSubmit")}
      />
    </MultisigDraft.Container>
  );
}

export default {
  [KeyFlow.CreateWallet]: renderFlavor(KeyFlow.CreateWallet),
  [KeyFlow.RecoverWallet]: renderFlavor(KeyFlow.RecoverWallet),
  [KeyFlow.EditWallet]: renderFlavor(KeyFlow.EditWallet),
};
