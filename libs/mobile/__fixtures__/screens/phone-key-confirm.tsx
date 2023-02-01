import { mockAction, MultisigDraft } from "../../src/fixture-helpers";
import { KeyFlow } from "../../src/screens/keys";
import {
  PhoneKeyConfirm,
  PhoneKeyConfirmProps,
} from "../../src/screens/keys/phone";

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
  [KeyFlow.ReplaceKey]: renderFlavor(KeyFlow.ReplaceKey),
};
