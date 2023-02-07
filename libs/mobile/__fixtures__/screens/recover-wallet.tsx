import { mockAction, MultisigDraft } from "../../src/fixture-helpers";
import { RecoverWallet } from "../../src/screens/recover-wallet";

export default (
  <MultisigDraft.Container>
    <RecoverWallet
      draftId={MultisigDraft.draftId}
      onSubmit={async () => {
        mockAction("onSubmit")();
      }}
      onAddSocial={mockAction("onAddSocial")}
      onAddEmail={mockAction("onAddEmail")}
    />
  </MultisigDraft.Container>
);
