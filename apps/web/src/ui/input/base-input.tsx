import { cn } from "@/lib/utils";
import { DetailedHTMLProps, forwardRef, InputHTMLAttributes } from "react";

export type BaseInputProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

export const BaseInput = forwardRef<HTMLInputElement, BaseInputProps>(
  function BaseInput({ className, ...rest }: BaseInputProps, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          // we need to remove focus and hover styles
          "p-0 text-lg text-white hover:border-transparent focus:border-transparent focus:outline-none focus:ring-0",
          "bg-transparent",
          className,
        )}
        {...rest}
      />
    );
  },
);
