import Lottie from "lottie-react";
import { observer } from "mobx-react-lite";

import promptAnimation from "../assets/prompt.json";

export interface PromptAnimationProps {
  loop: boolean | undefined;
}

export const PromptAnimation = observer<PromptAnimationProps>(
  function PromptAnimation({ loop }) {
    return (
      <Lottie
        animationData={promptAnimation}
        autoPlay
        loop={loop}
        style={{
          width: 60,
          height: 60,
          zIndex: -1,
          position: "absolute",
          top: 0,
          bottom: 0,
          margin: "auto",
        }}
      />
    );
  },
);
