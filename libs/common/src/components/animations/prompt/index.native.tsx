import LottieView from "lottie-react-native";
import { observer } from "mobx-react-lite";

export interface PromptAnimationProps {
  loop: boolean;
}

export const PromptAnimation = observer<PromptAnimationProps>(
  function PromptAnimation({ loop }) {
    return (
      <LottieView
        source={require("../assets/prompt.json.json")}
        autoPlay
        loop={loop}
        style={{ width: 60, zIndex: -1, position: "absolute" }}
      />
    );
  }
);
