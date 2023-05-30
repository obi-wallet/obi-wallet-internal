import Lottie from "lottie-react";
import { observer } from "mobx-react-lite";

import confirmAnimation from "../assets/confirm.json";

export const ConfirmAnimation = observer(function ConfirmAnimation() {
  return (
    <Lottie
      animationData={confirmAnimation}
      autoPlay
      loop={false}
      style={{ width: 60, zIndex: -1, position: "absolute" }}
    />
  );
});
