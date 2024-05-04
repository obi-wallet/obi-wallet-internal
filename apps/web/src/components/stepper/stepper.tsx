import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef } from "react";

export interface StepperProps extends ComponentPropsWithoutRef<"div"> {
  totalSteps: number;
  currentStep: number;
}

export function Stepper({
  totalSteps,
  currentStep,
  className,
  ...rest
}: StepperProps) {
  return (
    <div
      className={cn("flex flex-row justify-center space-x-1", className)}
      {...rest}
    >
      {new Array(totalSteps).fill(0).map((_, step) => {
        return (
          <div
            key={`stepper-${step}`}
            className={cn(
              "h-1 w-10 rounded-xl",
              step + 1 === currentStep ? "bg-blue-600" : "bg-zinc-400",
            )}
          />
        );
      })}
    </div>
  );
}
