import { useTheme } from "@emotion/react";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import {
  Text as OriginalText,
  // eslint-disable-next-line no-restricted-imports
  TextInput as OriginalTextInput,
  TextInputProps,
  TextProps,
} from "react-native";

export const Text = observer<TextProps & { children: ReactNode }>(
  function Text({ children, style, ...props }) {
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
);

export const TextInput = observer<TextInputProps>(function TextInput({
  style,
  ...props
}) {
  const theme = useTheme();
  return (
    <OriginalTextInput
      style={[
        {
          fontFamily: theme.fonts.regular,
        },
        style,
      ]}
      placeholderTextColor="#555"
      {...props}
    />
  );
});
