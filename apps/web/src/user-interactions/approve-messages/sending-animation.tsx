import { Text } from "@/components";
import { cn } from "@/lib/utils";
import Lottie from "lottie-react";

import SendingAnimationJSON from "./sending-animation.json";

export function SendingAnimation({
  text,
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "absolute top-0 flex h-full w-full flex-1 flex-col items-center justify-center bg-black bg-opacity-80",
        className,
      )}
    >
      <div className="w-60 rounded-xl ">
        <Lottie animationData={SendingAnimationJSON} />
        <Text size="xl" className="justify-center text-white">
          {text ?? "Broadcasting"}
        </Text>
      </div>
    </div>
  );
}
