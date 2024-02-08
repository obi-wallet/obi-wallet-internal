import { useTheme } from "@emotion/react";
import { CustomTheme } from "@obi-wallet/theme";
import { observer } from "mobx-react-lite";
import {
  Platform,
  StyleSheet,
  TouchableHighlight,
  TouchableNativeFeedback,
  TouchableWithoutFeedbackProps,
  View,
} from "react-native";

import { Text } from "../typography";

const getBaseStyles = (theme: CustomTheme) =>
  StyleSheet.create({
    text: {
      fontSize: 12,
      color: theme.colors.primary,
      ...theme.textStyles.regular,
    },
    button: {
      height: 29,
      borderWidth: 1,
      borderRadius: 19,
      borderColor: theme.colors.primary,
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
  const theme = useTheme();
  const baseStyles = getBaseStyles(theme);
  const children = <Text style={baseStyles.text}>{label}</Text>;

  const buttonProps = {
    ...props,
    children,
    style: [baseStyles.button, props.style],
  };

  if (Platform.OS === "android") {
    return (
      <TouchableNativeFeedback {...buttonProps}>
        <View style={[baseStyles.button, props.style]}>{children}</View>
      </TouchableNativeFeedback>
    );
  } else {
    return <TouchableHighlight {...buttonProps} />;
  }
});
