import { cn } from "@/lib/utils";
import { BaseInput } from "@/ui/input/base-input";
import { DetailedHTMLProps, InputHTMLAttributes } from "react";

export interface InputProps
  extends Omit<
    DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
    "onChange"
  > {
  label: string;
  labelClassname: string;
  onChange?: (value: string) => void;
}

export function Input({
  labelClassname,
  label,
  onChange,
  ...rest
}: InputProps) {
  return (
    <div className="flex w-full flex-col">
      <div className="relative w-full">
        <label>
          <BaseInput
            {...rest}
            onChange={
              onChange
                ? (e) => {
                    onChange(e.target.value);
                  }
                : undefined
            }
          />
          <span
            className={cn(
              "absolute left-0 top-0 ml-5 -translate-y-1/2 px-2 py-1 text-xs text-white",
              labelClassname,
            )}
          >
            {label}
          </span>
        </label>
      </div>
    </div>
  );
}
