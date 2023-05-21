import { observer } from "mobx-react-lite";

import { SignInteractionModal } from "./sign-interaction-modal";

export {
  ConfirmMessages,
  PrettyMessage,
  createDeviceKeySigner,
  createUsableSigners,
  PhoneKeySigner,
} from "./signature-modal";
export type {
  ConfirmMessagesProps,
  PrettyMessageProps,
} from "./signature-modal";

export const Modals = observer(function Modals() {
  return <SignInteractionModal />;
});
