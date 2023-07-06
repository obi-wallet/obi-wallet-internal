import LottieView from "lottie-react-native";
import { observer } from "mobx-react-lite";

export const LoadingAnimation = observer(function LoadingAnimation() {
  return (
    <LottieView
      source={require("../assets/loading.json")}
      autoPlay
      loop={true}
      style={{ width: 30, zIndex: -1, position: "absolute" }}
    />
  );
});
