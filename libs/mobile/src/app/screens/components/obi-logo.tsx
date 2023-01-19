import { StyleProp, View, ViewStyle } from "react-native";

import Obi from "../../../assets/obi.svg";

export function ObiLogo({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View
      style={[
        {
          backgroundColor: "#ffffff",
          borderRadius: 999,
        },
        style,
      ]}
    >
      <Obi />
    </View>
  );
}
