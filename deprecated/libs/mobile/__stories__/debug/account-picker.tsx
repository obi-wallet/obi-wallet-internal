import { AccountPickerModal } from "@obi-wallet/common";

export default <AccountPickerModal visible={true} open={noop} close={noop} />;

function noop() {
  // noop
}
