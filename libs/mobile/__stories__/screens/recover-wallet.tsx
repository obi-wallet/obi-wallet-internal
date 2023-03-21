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
      onAddNfc={mockAction("onAddNfc")}
      onRecoverNfc={mockAction("onRecoverNfc")}
      onAddCloud={mockAction("onAddCloud")}
      onRecoverCloud={mockAction("onRecoverCloud")}
      onAddEmail={mockAction("onAddEmail")}
    />
  </MultisigDraft.Container>
);
