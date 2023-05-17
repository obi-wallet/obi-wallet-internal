import { useTheme } from "@emotion/react";
import { useStore } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import { ImageBackground, View } from "react-native";

export interface InitialBackgroundProps {
  children?: ReactNode;
}

export const InitialBackground = observer(function InitialBackground(
  props: InitialBackgroundProps
) {
  const { configStore } = useStore();
  const theme = useTheme();
  const styles = {
    backgroundColor: theme.colors.background,
    flex: 1,
  };
  return configStore.isObi() ? (
    <View style={styles} {...props} />
  ) : (
    <ImageBackground
      source={require("./assets/background.png")}
      resizeMode="cover"
      imageStyle={{ height: 609 }}
      style={styles}
      {...props}
    />
  );
});
