import LottieView from "lottie-react-native";
import { observer } from "mobx-react-lite";

export const ConfirmAnimation = observer(function ConfirmAnimation() {
  return (
    <LottieView
      source={require("../assets/confirm.json")}
      autoPlay
      style={{ width: 60, zIndex: -1, position: "absolute" }}
    />
  );
});
