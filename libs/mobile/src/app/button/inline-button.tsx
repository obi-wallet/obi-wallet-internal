import { Text } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import {
  Platform,
  StyleSheet,
  TouchableHighlight,
  TouchableNativeFeedback,
  TouchableWithoutFeedbackProps,
  View,
} from "react-native";

import { useStore } from "../stores";

const getBaseStyles = (isObi: boolean) =>
  StyleSheet.create({
    text: {
      fontWeight: "500",
      fontSize: 12,
      color: isObi ? "#437DFF" : "#6959E6",
      ...(isObi ? { fontFamily: "poppins" } : {}),
    },
    button: {
      height: 29,
      borderWidth: 1,
      borderRadius: 19,
      borderColor: isObi ? "#437DFF" : "rgba(105, 89, 230, 0.4)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 15,
      marginLeft: 8,
    },
  });

export interface InlineButtonProps
  extends Omit<TouchableWithoutFeedbackProps, "children"> {
  label: string;
}

export const InlineButton = observer(function InlineButton({
  label,
  ...props
}: InlineButtonProps) {
  const { configStore } = useStore();
  const isObi = configStore.isObi();
  const baseStyles = getBaseStyles(isObi);
  const children = <Text style={baseStyles.text}>{label}</Text>;

  const buttonProps = {
    ...props,
    children,
    style: [baseStyles.button, props.style],
  };

  if (Platform.OS === "ios") {
    return <TouchableHighlight {...buttonProps} />;
  } else {
    return (
      <TouchableNativeFeedback {...buttonProps}>
        <View style={[baseStyles.button, props.style]}>{children}</View>
      </TouchableNativeFeedback>
    );
  }
});
