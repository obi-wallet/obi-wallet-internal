import { useTheme } from "@emotion/react";
import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import RNModal, { ModalProps as RNModalProps } from "react-native-modal";

export interface ModalProps extends Partial<RNModalProps> {
  isVisible: boolean;
  onClose: () => void;
}

export const MODAL_TIMING = 500;

export function Modal({ children, isVisible, onClose, ...props }: ModalProps) {
  return (
    <RNModal
      isVisible={isVisible}
      onBackdropPress={onClose}
      animationInTiming={MODAL_TIMING}
      animationOutTiming={MODAL_TIMING}
      backdropTransitionInTiming={MODAL_TIMING}
      backdropTransitionOutTiming={MODAL_TIMING}
      backdropOpacity={0.6}
      {...props}
      style={{ maxHeight: "90%" }}
    >
      <ModalContainer>{children}</ModalContainer>
    </RNModal>
  );
}

function ModalContainer({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 20,
    maxHeight: "100%",
  },
});
