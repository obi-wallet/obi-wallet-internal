import { observer } from "mobx-react-lite";
import { TouchableOpacity } from "react-native";
import { Image, View } from "react-native";

import Pencil from "./assets/pencil.svg";

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
      <Image
        source={require("./assets/fire.png")}
        style={{ maxHeight: "100%", maxWidth: "100%" }}
      />
      <TouchableOpacity
        style={{
          width: 20,
          height: 20,
          position: "absolute",
          right: 5,
          top: 5,
        }}
      >
        <Pencil />
      </TouchableOpacity>
    </View>
  );
});
