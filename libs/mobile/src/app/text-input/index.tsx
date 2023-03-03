import { Text, TextInput as OriginalTextInput } from "@obi-wallet/common";
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

import { isSmallScreenNumber } from "../screens/components/screen-size";
import { useStore } from "../stores";

const getStyles = (isObi: boolean) =>
  StyleSheet.create({
    label: {
      color: isObi ? "white" : "#787B9C",
      fontSize: 10,
      marginBottom: 5,
      textTransform: "uppercase",
      ...(isObi ? { fontFamily: "poppins" } : {}),
    },
    input: {
      width: "100%",
      height: isSmallScreenNumber(46, 56),
      borderWidth: 1,
      borderColor: isObi ? "white" : "#2F2B4C",
      paddingLeft: 20,
      fontSize: isSmallScreenNumber(10, 14),
      fontWeight: "500",
      color: "#F6F5FF",
      borderRadius: isObi ? 30 : 12,
      ...(isObi ? { fontFamily: "poppins" } : {}),
    },
  });

export const TextInput = observer<
  TextInputProps & {
    CustomTextInput?: ComponentType<TextInputProps>;
    label?: string;
    style?: StyleProp<ViewStyle>;
    inputStyle?: StyleProp<TextStyle>;
  }
>(function TextInput({
  label,
  style,
  inputStyle,
  CustomTextInput = OriginalTextInput,
  ...props
}) {
  const { configStore } = useStore();
  const isObi = configStore.isObi();
  const styles = getStyles(isObi);
  return (
    <View style={style}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <CustomTextInput
        style={[styles.input, inputStyle]}
        placeholderTextColor={isObi ? "rgba(250,250,250,.5)" : "#4B4E6E"}
        {...props}
      />
    </View>
  );
});
