import { cn } from "@/lib/utils";
import { DetailedHTMLProps, InputHTMLAttributes } from "react";

export interface BaseInputProps
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {}

export function BaseInput({ className, ...rest }: BaseInputProps) {
  return (
    <input
      className={cn(
        "border-foreground-primary-border peer w-full rounded-xl border bg-transparent px-7 py-6 text-2xl font-normal text-white focus:border-blue-600 focus-visible:outline-none",
        "[-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none",
        className,
      )}
      {...rest}
    />
  );
}
