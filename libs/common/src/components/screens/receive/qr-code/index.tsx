import { observer } from "mobx-react-lite";
import QRCode from "react-qr-code";

export interface QrCodeProps {
  value: string;
  size: number;
}

export const QrCode = observer<QrCodeProps>(function QrCode({ value, size }) {
  return (
    <QRCode
      value={value}
      style={{
        width: size,
        height: size,
      }}
    />
  );
});
