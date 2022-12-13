import { useTheme } from "@emotion/react";
import { ReactNode } from "react";
import {
  Text as OriginalText,
  TextInput as OriginalTextInput,
  TextInputProps,
  TextProps,
} from "react-native";

export function Text({
  children,
  style,
  isObi = false,
  ...props
}: TextProps & { children: ReactNode; isObi?: boolean }) {
  const theme = useTheme();

  return (
    <OriginalText
      style={[
        {
          fontFamily: theme.fonts.regular,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </OriginalText>
  );
}

export function TextInput({
  style,
  isObi = false,
  ...props
}: TextInputProps & { isObi?: boolean }) {
  const theme = useTheme();
  return (
    <OriginalTextInput
      style={[
        {
          fontFamily: theme.fonts.regular,
        },
        style,
      ]}
      {...props}
    />
  );
}
