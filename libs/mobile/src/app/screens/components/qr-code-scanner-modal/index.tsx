import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Modal, ModalProps } from "react-native";
import QRCodeScanner from "react-native-qrcode-scanner";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "../../../button";
import { useStore } from "../../../stores";

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
    <Modal {...props}>
      <QRCodeScanner
        onRead={({ data }) => {
          onScan(data);
        }}
        cameraStyle={{ height: "100%" }}
        bottomContent={
          <Button
            flavor="green"
            label="Cancel"
            onPress={() => {
              onClose();
            }}
          />
        }
        bottomViewStyle={{
          paddingHorizontal: 20,
          position: "absolute",
          marginVertical: safeArea.left,
          bottom: safeArea.bottom,
        }}
        reactivate
        showMarker
      />
    </Modal>
  );
});

export function useQrCodeScannerModal(onScan: (scannedData: string) => void) {
  const [visible, setVisible] = useState(false);

  return {
    open() {
      setVisible(true);
    },
    render() {
      return (
        <QrCodeScannerModal
          visible={visible}
          onScan={(data) => {
            onScan(data);
            setVisible(false);
          }}
          onClose={() => {
            setVisible(false);
          }}
        />
      );
    },
  };
}
