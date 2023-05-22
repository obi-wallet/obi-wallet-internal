import type { AnimationObject } from "lottie-react-native";
import { observer } from "mobx-react-lite";
import { StyleProp, ViewStyle } from "react-native";
import warning from "tiny-warning";

export interface LoaderProps {
  loadingText?: string;
  style?: StyleProp<ViewStyle>;
  animation?: string | AnimationObject;
  animationStyles?: StyleProp<ViewStyle>;
}

export const Loader = observer<LoaderProps>(function Loader() {
  warning(false, "Loader is not implemented for web");
  return null;
});
