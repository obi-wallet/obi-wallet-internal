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
          "lg:text-md p-0 text-white hover:border-transparent focus:border-transparent focus:outline-none focus:ring-0 max-sm:text-xs md:text-sm",
          "bg-transparent",
          className,
        )}
        {...rest}
      />
    );
  },
);
