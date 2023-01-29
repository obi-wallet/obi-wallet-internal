import { AccountPickerModal } from "../../src";

export default function AccountPicker() {
  return (
    <AccountPickerModal
      visible={true}
      showNotReadyWallets
      open={noop}
      close={noop}
    />
  );
}

function noop() {
  // noop
}
