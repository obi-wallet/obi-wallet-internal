import { useTheme } from "@emotion/react";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export interface ScreenContainerProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}
export const ScreenContainer = observer<ScreenContainerProps>(
  function ScreenContainer({ children, style }) {
    const theme = useTheme();

    return (
      <SafeAreaView
        style={[
          {
            flex: 1,
            backgroundColor: theme.colors.background,
            paddingHorizontal: 20,
            justifyContent: "space-between",
          },
          style,
        ]}
      >
        {children}
      </SafeAreaView>
    );
  }
);
