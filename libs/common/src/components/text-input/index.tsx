import { useTheme } from "@emotion/react";
import { observer } from "mobx-react-lite";
import { ComponentType } from "react";
import {
  StyleProp,
  StyleSheet,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import { isSmallScreenNumber } from "../../helpers";
import { BaseTextInput, Text } from "../typography";

const styles = StyleSheet.create({
  label: {
    color: "white",
    fontSize: 10,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  input: {
    width: "100%",
    height: isSmallScreenNumber(46, 56),
    borderWidth: 1,
    borderColor: "white",
    paddingLeft: 20,
    fontSize: isSmallScreenNumber(10, 14),
    fontWeight: "500",
    color: "#F6F5FF",
    borderRadius: 30,
  },
});
export type CustomTextInputProps = TextInputProps & {
  CustomTextInput?: ComponentType<TextInputProps>;
  label?: string;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  invalidMessage?: string;
};
export const TextInput = observer<CustomTextInputProps>(function TextInput({
  label,
  style,
  inputStyle,
  labelStyle,
  invalidMessage,
  CustomTextInput = BaseTextInput,
  ...props
}) {
  const theme = useTheme();
  return (
    <View style={style}>
      {label ? (
        <Text style={[styles.label, theme.textInput.labelStyle]}>{label}</Text>
      ) : null}
      <CustomTextInput
        style={[
          styles.input,
          inputStyle,
          invalidMessage ? { borderColor: "#FF2222" } : undefined,
          theme.textInput?.inputStyle,
        ]}
        placeholderTextColor="rgba(250,250,250,.5)"
        {...props}
      />
      <TextInputInvalidMessage message={invalidMessage} />
    </View>
  );
});

export const TextInputInvalidMessage = observer<{ message?: string }>(
  function TextInputInvalidMessage({ message }) {
    if (!message) return null;
    return (
      <Text
        style={{
          color: "#E10E34",
          fontSize: 12,
          marginTop: 5,
          marginLeft: 5,
        }}
      >
        {message}
      </Text>
    );
  },
);
