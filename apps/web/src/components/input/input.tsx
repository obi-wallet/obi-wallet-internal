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
  id,
  onChange,
  className,
  defaultValue = "",
  startIcon: StartIcon,
  endIcon: EndIcon,
  classNames,
  disabled,
  placeholder,
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
    <div className="relative w-full ">
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
        id={id}
        type="text"
        className={cn(
          "peer w-full rounded-xl border border-zinc-800 bg-transparent px-7 py-6 text-2xl font-normal text-white focus:border-blue-600 focus-visible:outline-none",
          "[-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none",
          StartIcon && "px-9",
          className,
        )}
        required
        value={text}
        onChange={handleChange}
        {...rest}
        disabled={disabled}
        placeholder=""
      />

      <label
        htmlFor={id}
        className="absolute left-0 top-0 ml-5 -translate-y-1/2 bg-slate-950 px-2 py-1 text-xs text-white"
      >
        {placeholder}
      </label>

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
