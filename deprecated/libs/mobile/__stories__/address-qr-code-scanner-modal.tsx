import { QrCodeScannerModal } from "@obi-wallet/common";

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
