import { observer } from "mobx-react-lite";

import { SignInteractionModal } from "./sign-interaction-modal";

export { PrettyMessage } from "./signature-modal";

export const Modals = observer(function Modals() {
  return <SignInteractionModal />;
});
