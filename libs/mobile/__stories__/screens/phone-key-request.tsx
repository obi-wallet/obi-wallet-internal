import {
  KeyFlow,
  PhoneKeyRequest,
  PhoneKeyRequestProps,
} from "@obi-wallet/common";

import { mockAction, MultisigDraft } from "../../src/fixture-helpers";

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
