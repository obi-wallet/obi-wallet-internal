import Lottie from "lottie-react";
import { observer } from "mobx-react-lite";

import loadingAnimation from "../assets/loading.json";

export const LoadingAnimation = observer(function LoadingAnimation() {
  return (
    <Lottie
      animationData={loadingAnimation}
      autoPlay
      loop
      style={{ width: 30, zIndex: -1, position: "absolute" }}
    />
  );
});
