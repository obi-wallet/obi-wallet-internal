import { observer } from "mobx-react-lite";
import { useState } from "react";
import { ModalProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { QrCodeScanner } from "./qr-code-scanner";
import { BaseModal } from "../base-modal";
import { Button } from "../buttons";

export interface QrCodeScannerModalProps extends ModalProps {
  onScan: (address: string) => void;
  onClose: () => void;
}

export const QrCodeScannerModal = observer(function QrCodeScannerModal({
  onClose,
  onScan,
  ...props
}: QrCodeScannerModalProps) {
  const safeArea = useSafeAreaInsets();

  return (
    <BaseModal {...props}>
      <QrCodeScanner
        onRead={({ data }) => {
          onScan(data);
        }}
        cameraStyle={{ height: "100%" }}
        bottomContent={
          <Button
            flavor="primary"
            label="Cancel"
            onPress={() => {
              onClose();
            }}
          />
        }
        bottomViewStyle={{
          paddingHorizontal: 20,
          position: "absolute",
          bottom: safeArea.bottom,
        }}
        reactivate
        showMarker
      />
    </BaseModal>
  );
});

export function useQrCodeScannerModal(
  onScan: (params: { data: string; close(): void }) => void
) {
  const [visible, setVisible] = useState(false);

  return {
    visible,
    open() {
      setVisible(true);
    },
    render() {
      return (
        <QrCodeScannerModal
          visible={visible}
          onScan={(data) => {
            onScan({
              data,
              close() {
                setVisible(false);
              },
            });
          }}
          onClose={() => {
            setVisible(false);
          }}
        />
      );
    },
  };
}
