import { useTheme } from "@emotion/react";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import { View } from "react-native";

export interface InitialBackgroundProps {
  children?: ReactNode;
}

export const InitialBackground = observer(function InitialBackground(
  props: InitialBackgroundProps
) {
  const theme = useTheme();
  return (
    <View
      style={{
        backgroundColor: theme.colors.background,
        flex: 1,
      }}
      {...props}
    />
  );
});
