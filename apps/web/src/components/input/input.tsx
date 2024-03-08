"use client";

import { cn } from "@/lib/utils";
import {
  ChangeEvent,
  ComponentPropsWithoutRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { IconType } from "react-icons";

interface InputProps
  extends Omit<ComponentPropsWithoutRef<"input">, "onChange"> {
  startIcon?: IconType;
  endIcon?: IconType;
  labelBgColor?: string;
  labelText?: string;
  value?: string | number;
  errorMessage?: string;
  classNames?: {
    startIcon?: string;
    endIcon?: string;
  };
  onChange?: (value: string) => void;
  InputRef?: React.RefObject<HTMLInputElement>;
}
interface ParentRef {
  focus: () => void;
}

export const Input = forwardRef<ParentRef, InputProps>(function Input(
  {
    id,
    labelText,
    onChange,
    className,
    startIcon: StartIcon,
    endIcon: EndIcon,
    classNames,
    disabled,
    placeholder,
    labelBgColor,
    value,
    type = "text",
    errorMessage,
    defaultValue,
    ...rest
  }: InputProps,
  parentRef: React.Ref<ParentRef>,
) {
  const [text, setText] = useState<string>("");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setText(defaultValue as string);
  }, [defaultValue]);

  useImperativeHandle(parentRef, () => ({
    // This function exposes the localRef's current value to the parent
    // You can also expose other methods or values if needed
    focus: () => {
      ref.current?.focus();
    },
  }));

  useEffect(() => {
    if (value !== text) {
      if (type === "number" && isNaN(Number(value))) return;
      setText(value as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    if (type === "number" && isNaN(Number(value))) return;
    setText(value.trim());
    onChange && onChange(value.trim());
  };

  const renderErrorMessage = (message: string) => {
    if (message.includes("Expected number")) {
      return "Invalid number";
    }
    return message;
  };

  return (
    <div className="flex w-full flex-col ">
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
          className={cn(
            "border-foreground-primary-border focus:border-background-primary-active peer w-full rounded-xl border bg-transparent px-7 py-6 text-2xl font-normal text-white focus-visible:outline-none",
            "[-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none",
            StartIcon && "px-9",
            errorMessage
              ? ":focus:border-red-500 border-red-500"
              : "  focus:border-background-primary-active ",
            className,
          )}
          required
          value={text || ""}
          onChange={(e) => {
            !disabled && handleChange(e);
          }}
          disabled={disabled}
          placeholder={placeholder}
          type="text"
          {...rest}
        />
        {labelText && (
          <label
            htmlFor={id}
            className={cn(
              "bg-background-secondary absolute left-0 top-0 ml-5 -translate-y-1/2 px-2 py-1 text-xs text-white",
              labelBgColor,
            )}
          >
            {labelText}
          </label>
        )}
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

        {errorMessage && (
          <div className=" absolute bottom-6 ml-7 h-1 w-full  text-sm  text-red-800">
            {renderErrorMessage(errorMessage)}
          </div>
        )}
      </div>
    </div>
  );
});
