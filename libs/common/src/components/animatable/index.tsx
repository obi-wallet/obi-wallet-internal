import { View } from "react-native";
import type { View as AView } from "react-native-animatable";

// @ts-expect-error We ignore the type errors for now
export const AnimatableView: AView = View;
