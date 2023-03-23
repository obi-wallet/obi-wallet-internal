import { observer } from "mobx-react-lite";

import { SignInteractionModal } from "./sign-interaction-modal";
import { WalletConnectInteractionModal } from "./wallet-connect-interaction-modal";

export const Modals = observer(function Modals() {
  return (
    <>
      <SignInteractionModal />
      <WalletConnectInteractionModal />
    </>
  );
});
