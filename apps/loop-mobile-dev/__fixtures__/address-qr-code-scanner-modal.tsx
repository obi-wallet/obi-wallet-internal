import { AddressQrCodeScannerModal } from "@obi-wallet/mobile";

export default (
  <AddressQrCodeScannerModal
    visible
    onScan={(address) => {
      console.log("onScan", address);
    }}
    onClose={() => {
      console.log("onClose");
    }}
  />
);
