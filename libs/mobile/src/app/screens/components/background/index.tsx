import { useTheme } from "@emotion/react";
import { Image, View } from "react-native";

import { useStore } from "../../../stores";

export function Background() {
  const theme = useTheme();
  const { settingsStore } = useStore();
  const isObi = settingsStore.isObi();

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        marginRight: -40,
        backgroundColor: theme.colors.background,
      }}
    >
      {isObi ? null : (
        <>
          <Image
            source={require("./assets/background-blue.png")}
            style={{ top: 200, left: 0, position: "absolute" }}
          />
          <Image
            source={require("./assets/background-purple.png")}
            style={{ position: "absolute", top: 0, right: 0 }}
          />
        </>
      )}
    </View>
  );
}
