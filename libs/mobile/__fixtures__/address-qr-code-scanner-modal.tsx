import { AddressQrCodeScannerModal } from "../src";

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
