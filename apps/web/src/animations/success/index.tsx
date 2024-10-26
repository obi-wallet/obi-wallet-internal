import Lottie from "lottie-react";

import animationData from "./animation.json";
import { AnimationProps } from "../abstract";

export function SuccessAnimation(props: AnimationProps) {
  return <Lottie animationData={animationData} loop={false} {...props} />;
}
