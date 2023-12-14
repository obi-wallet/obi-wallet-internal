import { CreateWallet } from "@obi-wallet/common";

import { mockAction, MultisigDraft } from "../../src/fixture-helpers";

export default (
  <MultisigDraft.Container>
    <CreateWallet
      loading={false}
      draftId={MultisigDraft.draftId}
      onSubmit={mockAction("onSubmit")}
      onAddSocial={mockAction("onAddSocial")}
      onAddNfc={mockAction("onAddNfc")}
      onAddCloud={mockAction("onAddCloud")}
      onAddEmail={mockAction("onAddEmail")}
      onAddZAuth={mockAction("onAddZauth")}
      onAddPhone={mockAction("onAddPhone")}
      onAddTelegram={mockAction("onAddTelegram")}
    />
  </MultisigDraft.Container>
);
