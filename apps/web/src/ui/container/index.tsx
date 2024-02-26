import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function InputContainer({
  children,
  label,
  className,
  labelClassname,
  onClick,
}: {
  children: ReactNode;
  label?: string;
  className?: string;
  labelClassname: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={cn(
        "hover:border-color hover:border-background-primary-disabled relative rounded-xl border border-gray-700 p-6",
        "focus-within:border-background-primary-disabled",
        "flex items-center justify-between",
        className,
      )}
      onClick={onClick}
    >
      {children}
      {label ? (
        <label
          className={cn(
            "absolute left-0 top-0 ml-5 -translate-y-1/2 px-2 py-1 text-xs text-white",
            labelClassname,
          )}
        >
          {label}
        </label>
      ) : null}
    </div>
  );
}
