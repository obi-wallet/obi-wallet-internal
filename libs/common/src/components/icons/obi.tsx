import { observer } from "mobx-react-lite";
import { StyleProp, View, ViewStyle } from "react-native";

export const ObiIcon = observer(function ObiLogo({
  style,
}: {
  style?: StyleProp<ViewStyle>;
}) {
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
      {/* TODO */}
    </View>
  );
});
