import { observer } from "mobx-react-lite";
import type { ModalProps as RNModalProps } from "react-native-modal";
import warning from "tiny-warning";

export interface ModalProps extends Partial<RNModalProps> {
  isVisible: boolean;
  onClose: () => void;
}

export const Modal = observer(function Modal({
  children,
  isVisible,
  onClose,
  ...props
}: ModalProps) {
  warning(false, "Modal is not implemented for web");
  return null;
});
