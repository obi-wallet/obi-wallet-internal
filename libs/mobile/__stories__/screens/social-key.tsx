import { KeyFlow } from "@obi-wallet/common";

import { mockAction, MultisigDraft } from "../../src/fixture-helpers";
import { SocialKey, SocialKeyProps } from "../../src/screens/keys/social";

function renderFlavor(flow: SocialKeyProps["flow"]) {
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
