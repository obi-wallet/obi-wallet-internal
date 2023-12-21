import * as React from "react";

import { cn } from "@/lib/utils";

type BoxProps = {
  totalSteps?: number;
  currentStep?: number;
} & React.ComponentPropsWithoutRef<"div">;

export const Stepper = ({
  totalSteps = 5,
  currentStep = 1,
  className,
  ...rest
}: BoxProps) => {
  return (
    <div
      className={cn("flex flex-row justify-center space-x-1", className)}
      {...rest}
    >
      {new Array(totalSteps).fill(0).map((_, step) => (
        <div
          key={`stepper-${step}`}
          className={cn(
            "h-1 w-10 rounded-xl",
            step + 1 === currentStep ? "bg-blue-600" : "bg-zinc-400",
          )}
        />
      ))}
    </div>
  );
};
