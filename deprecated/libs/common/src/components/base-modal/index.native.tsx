import { observer } from "mobx-react-lite";
import { Modal as OriginalModal, ModalProps } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export const BaseModal = observer<ModalProps>(function Modal({
  children,
  ...props
}) {
  return (
    <OriginalModal {...props}>
      {/* See https://github.com/th3rdwave/react-native-safe-area-context/issues/279#issuecomment-1159644248 */}
      <SafeAreaProvider>{children}</SafeAreaProvider>
    </OriginalModal>
  );
});
