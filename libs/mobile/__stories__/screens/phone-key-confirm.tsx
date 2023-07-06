import {
  KeyFlow,
  PhoneKeyConfirm,
  PhoneKeyConfirmProps,
} from "@obi-wallet/common";

import { mockAction, MultisigDraft } from "../../src/fixture-helpers";

function renderFlavor(flow: PhoneKeyConfirmProps["flow"]) {
  return (
    <MultisigDraft.Container>
      <PhoneKeyConfirm
        draftId={MultisigDraft.draftId}
        flow={flow}
        demoMode
        phoneNumber="123"
        securityAnswer="foo"
        securityQuestion="bar"
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
