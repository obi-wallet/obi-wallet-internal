import { observer } from "mobx-react-lite";
import { TouchableOpacity, TouchableWithoutFeedbackProps } from "react-native";

export type IconButtonProps = TouchableWithoutFeedbackProps;

export const IconButton = observer(function IconButton(props: IconButtonProps) {
  return (
    // icon-button doesn't work on Android, Android seems to work fine with
    // `TouchableOpacity` in this case, but not with `TouchableNativeFeedback`.
    <TouchableOpacity
      {...props}
      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
    />
  );
});
