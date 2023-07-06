import { Language } from "@obi-wallet/config";
import { observer } from "mobx-react-lite";
import { DropDownPickerProps } from "react-native-dropdown-picker";
import warning from "tiny-warning";

export const DropDownPicker = observer<DropDownPickerProps<Language | null>>(
  function DropDownPicker() {
    warning(false, "DropDownPicker not implemented for web");
    return null;
  }
);
