import { useTheme } from "@emotion/react";
import { Brand } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { ImageBackground, View } from "react-native";

import { useStore } from "../../../stores";

export interface InitialBackgroundProps {
  children?: React.ReactNode;
}

export const InitialBackground = observer((props: InitialBackgroundProps) => {
  const { settingsStore } = useStore();
  const theme = useTheme();
  const styles = {
    backgroundColor: theme.colors.background,
    flex: 1,
  };
  console.log(theme.colors.background);
  return settingsStore.isObi() ? (
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
