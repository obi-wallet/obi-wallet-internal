import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
            paddingHorizontal: 20,
            justifyContent: "space-between",
          },
          style,
        ]}
      >
        {children}
      </SafeAreaView>
    );
  },
);
