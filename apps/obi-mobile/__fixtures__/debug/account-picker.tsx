import { AccountPickerModal } from "@obi-wallet/mobile";

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
