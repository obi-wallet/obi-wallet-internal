import { mockAction, MultisigDraft } from "../../src/fixture-helpers";
import { KeyFlow } from "../../src/screens/keys";
import {
  PhoneKeyRequest,
  PhoneKeyRequestProps,
} from "../../src/screens/keys/phone";

function renderFlavor(flow: PhoneKeyRequestProps["flow"]) {
  return (
    <MultisigDraft.Container>
      <PhoneKeyRequest flow={flow} demoMode onSubmit={mockAction("onSubmit")} />
    </MultisigDraft.Container>
  );
}

export default {
  [KeyFlow.CreateWallet]: renderFlavor(KeyFlow.CreateWallet),
  [KeyFlow.RecoverWallet]: renderFlavor(KeyFlow.RecoverWallet),
  [KeyFlow.EditWallet]: renderFlavor(KeyFlow.EditWallet),
};
