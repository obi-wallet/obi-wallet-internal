import { DeviceKey, KeyFlow } from "@obi-wallet/common";

import { mockAction, MultisigDraft } from "../../src/fixture-helpers";

export default (
  <MultisigDraft.Container>
    <DeviceKey
      draftId={MultisigDraft.draftId}
      demoMode
      onSubmit={mockAction("onSubmit")}
      flow={KeyFlow.CreateWallet}
    />
  </MultisigDraft.Container>
);
