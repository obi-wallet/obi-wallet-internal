import Lottie from "lottie-react";
import { observer } from "mobx-react-lite";

import promptAnimation from "../assets/prompt.json";

export interface PromptAnimationProps {
  loop: boolean | undefined;
}

export const PromptAnimation = observer<PromptAnimationProps>(
  function PromptAnimation() {
    return (
      <Lottie
        animationData={promptAnimation}
        autoPlay
        loop={true}
        style={{ width: 60, zIndex: -1, position: "absolute" }}
      />
    );
  }
);
