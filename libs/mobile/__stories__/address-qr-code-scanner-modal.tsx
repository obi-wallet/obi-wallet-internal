import { QrCodeScannerModal } from "../src";

export default (
  <QrCodeScannerModal
    visible
    onScan={(data) => {
      console.log("onScan", data);
    }}
    onClose={() => {
      console.log("onClose");
    }}
  />
);
