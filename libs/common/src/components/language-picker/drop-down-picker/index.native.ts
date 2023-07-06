import DropDownPicker, { ThemeNameType } from "react-native-dropdown-picker";

import theme from "./theme";

DropDownPicker.addTheme("custom", theme as unknown as ThemeNameType);
DropDownPicker.setTheme("custom");

export { DropDownPicker };
