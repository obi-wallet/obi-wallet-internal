import { observer } from "mobx-react-lite";
import type { QRCodeProps } from "react-native-qrcode-svg";
import warning from "tiny-warning";

export const QrCode = observer<QRCodeProps>(function QrCode() {
  warning(false, "QrCode is not implemented for web");
  return null;
});
