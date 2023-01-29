import { useTheme } from "@emotion/react";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import {
  Text as OriginalText,
  TextInput as OriginalTextInput,
  TextInputProps,
  TextProps,
} from "react-native";

export const Text = observer(function Text({
  children,
  style,
  ...props
}: TextProps & { children: ReactNode }) {
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
});

export const TextInput = observer(function TextInput({
  style,

  ...props
}: TextInputProps) {
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
});
