"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
type InputProps = React.ComponentPropsWithoutRef<"input">;

export const Input = ({
  onChange,
  className,
  defaultValue,
  ...rest
}: InputProps) => {
  const [text, setText] = useState("");

  useEffect(() => {
    setText(defaultValue as string);
  }, [defaultValue]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);

    onChange && onChange(e);
  };

  return (
    <input
      type="text"
      name="title"
      id="title"
      className={cn(
        "block w-full rounded-md border border-zinc-800 bg-slate-950  px-8 py-2 font-normal text-white focus:border-gray-400",
        className,
      )}
      required
      value={text}
      onChange={handleChange}
      {...rest}
    />
  );
};
