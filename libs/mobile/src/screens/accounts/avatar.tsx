import { observer } from "mobx-react-lite";
import { TouchableOpacity } from "react-native";
import { View } from "react-native";

export const Avatar = observer(function Avatar() {
  return (
    <View
      style={{
        width: 95,
        height: 95,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "white",
        backgroundColor: "#272727",
      }}
    >
      <TouchableOpacity
        style={{
          width: 20,
          height: 20,
          backgroundColor: "white",
          position: "absolute",
          right: 5,
          top: 5,
        }}
      />
    </View>
  );
});
