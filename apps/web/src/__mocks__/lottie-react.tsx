import { forwardRef } from "react";

export const Lottie = forwardRef<HTMLDivElement>((props, ref) => {
  return <div ref={ref} data-testid="lottie-mock" />;
});

Lottie.displayName = "Lottie";
