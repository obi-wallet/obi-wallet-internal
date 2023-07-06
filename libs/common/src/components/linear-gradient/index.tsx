import { observer } from "mobx-react-lite";
import type { LinearGradientProps } from "react-native-linear-gradient";
import warning from "tiny-warning";

export const LinearGradient = observer<LinearGradientProps>(
  function LinearGradient() {
    warning(false, "LinearGradient not implemented for web");
    return null;
  }
);
