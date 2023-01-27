import { AccountPickerModal } from "../../src";

export default () => {
  return (
    <AccountPickerModal
      visible={true}
      showNotReadyWallets
      open={noop}
      close={noop}
    />
  );
};

function noop() {
  // noop
}
