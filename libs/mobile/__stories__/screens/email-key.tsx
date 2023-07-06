import { EmailKey, EmailKeyProps, KeyFlow } from "@obi-wallet/common";

import { mockAction, MultisigDraft } from "../../src/fixture-helpers";

function renderFlavor(flow: EmailKeyProps["flow"]) {
  return (
    <MultisigDraft.Container>
      <EmailKey
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
