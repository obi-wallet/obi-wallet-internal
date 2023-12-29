"use client";

import { cn } from "@/lib/utils";
import {
  ChangeEvent,
  ComponentPropsWithoutRef,
  useEffect,
  useState,
} from "react";
import { IconType } from "react-icons";

type InputProps = {
  startIcon?: IconType;
  endIcon?: IconType;
  classNames?: {
    startIcon?: string;
    endIcon?: string;
  };
} & ComponentPropsWithoutRef<"input">;

export function Input({
  onChange,
  className,
  defaultValue,
  startIcon: StartIcon,
  endIcon: EndIcon,
  classNames,
  disabled,
  ...rest
}: InputProps) {
  const [text, setText] = useState("");

  useEffect(() => {
    setText(defaultValue as string);
  }, [defaultValue]);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);

    onChange && onChange(e);
  };

  return (
    <div className="relative">
      {StartIcon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2">
          <StartIcon
            width={16}
            height={16}
            className={cn(
              "text-white",
              disabled && "opacity-50",
              classNames?.startIcon,
            )}
          />
        </span>
      )}
      <input
        type="text"
        name="title"
        id="title"
        className={cn(
          "block w-full rounded-md border border-zinc-800 bg-slate-950 px-8 py-2 font-normal text-white focus:border-blue-600 focus-visible:outline-none",
          className,
        )}
        required
        value={text}
        onChange={handleChange}
        {...rest}
        disabled={disabled}
      />
      {EndIcon && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          <EndIcon
            width={16}
            height={16}
            className={cn(
              "text-white",
              disabled && "opacity-50",
              classNames?.endIcon,
            )}
          />
        </span>
      )}
    </div>
  );
}
