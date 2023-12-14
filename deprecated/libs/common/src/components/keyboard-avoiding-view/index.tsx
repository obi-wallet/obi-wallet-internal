import { observer } from "mobx-react-lite";
import {
  KeyboardAvoidingView as OriginalKeyboardAvoidingView,
  KeyboardAvoidingViewProps,
  Platform,
} from "react-native";

export const KeyboardAvoidingView = observer(function KeyboardAvoidingView(
  props: KeyboardAvoidingViewProps,
) {
  return (
    <OriginalKeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      {...props}
    />
  );
});
