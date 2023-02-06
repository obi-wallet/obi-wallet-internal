import { mockAction, MultisigDraft } from "../../src/fixture-helpers";
import { CreateWallet } from "../../src/screens/create-wallet";

export default (
  <MultisigDraft.Container>
    <CreateWallet
      draftId={MultisigDraft.draftId}
      onSubmit={mockAction("onSubmit")}
      onAddSocial={mockAction("onAddSocial")}
      onAddEmail={mockAction("onAddEmail")}
    />
  </MultisigDraft.Container>
);
