import { useTheme } from "@emotion/react";
import { observer } from "mobx-react-lite";
import { View } from "react-native";

import { Text } from "../typography";

export interface ScreenTitleTextProps {
  title: string;
}

export const ScreenTitleText = observer<ScreenTitleTextProps>(
  function ScreenTitleText({ title }) {
    const theme = useTheme();
    const mainTitle = title.split(" ")[0];
    const subTitle = title.replace(mainTitle, "");

    return (
      <View
        style={{
          flexDirection: "row",
        }}
      >
        <Text style={theme.titleFalvors?.title}>{mainTitle}</Text>
        {subTitle && (
          <Text style={theme.titleFalvors?.subTitle}>{subTitle}</Text>
        )}
      </View>
    );
  },
);
