import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import { Platform, StyleProp, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { isSmallScreenNumber } from "../../helpers";

export interface ScreenContainerProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}
export const ScreenContainer = observer<ScreenContainerProps>(
  function ScreenContainer({ children, style }) {
    return (
      <SafeAreaView
        style={[
          {
            flex: 1,
            // backgroundColor: theme.colors.background,
            paddingHorizontal: 22,
            justifyContent: "space-between",
            paddingVertical:
              Platform.select({
                ios: isSmallScreenNumber(20, 20),
                android: isSmallScreenNumber(30, 30),
              }) || 36,
          },
          style,
        ]}
      >
        {children}
      </SafeAreaView>
    );
  },
);
