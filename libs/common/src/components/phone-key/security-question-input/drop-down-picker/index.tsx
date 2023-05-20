import { observer } from "mobx-react-lite";
import { DropDownPickerProps } from "react-native-dropdown-picker";
import invariant from "tiny-invariant";

export const DropDownPicker = observer<DropDownPickerProps<unknown | null>>(
  function DropDownPicker() {
    invariant(false, "DropDownPicker not implemented for web");
    return null;
  }
);
