import { Portal } from "@gorhom/portal";
import { observer } from "mobx-react-lite";
import { ModalProps, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export const BaseModal = observer<ModalProps>(function Modal({
  children,
  visible,
}) {
  if (!visible) return null;

  return (
    <Portal hostName="modals">
      <div
        style={{
          position: "fixed",
          inset: "0px",
          zIndex: 9999999,
          overflow: "hidden",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
        }}
      >
        <View style={{ height: "100%" }}>
          <SafeAreaProvider>{children}</SafeAreaProvider>
        </View>
      </div>
    </Portal>
  );
});
