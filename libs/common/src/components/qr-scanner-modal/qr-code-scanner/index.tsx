import { observer } from "mobx-react-lite";
import type { RNQRCodeScannerProps } from "react-native-qrcode-scanner";
import warning from "tiny-warning";

export const QrCodeScanner = observer<RNQRCodeScannerProps>(
  function QrCodeScanner() {
    warning(false, "QrCodeScanner not implemented for web");
    return null;
  }
);
