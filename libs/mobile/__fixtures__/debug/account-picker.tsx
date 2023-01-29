import { AccountPickerModal } from "../../src";

export default (
  <AccountPickerModal
    visible={true}
    showNotReadyWallets
    open={noop}
    close={noop}
  />
);

function noop() {
  // noop
}
