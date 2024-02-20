"use client";
import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef, useEffect, useRef } from "react";
import { ControllerFieldState } from "react-hook-form";

import { Input } from "./input";
import { AssetAmmount } from "..";
import { DropDown } from "../dropdown";

type AssetOption = {
  image: string;
  label: string;
  value: string;
  disabled?: boolean;
};

interface InputProps
  extends Omit<
    ComponentPropsWithoutRef<"input">,
    "onChange" | "onClick" | "onFocus"
  > {
  assets: AssetOption[];
  labelText?: string;
  onChange?: () => void;
  disableTextInput?: boolean;

  field: {
    onChange: (value: AssetAmmount) => void;
    onBlur: () => void;
    value: AssetAmmount;
  };
  fieldState: ControllerFieldState;
  direction?: "from" | "to";
  onClick?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

type errors = { [key: string]: { message: string; type: string } };

export function AssetInput({
  onChange,
  disabled,
  placeholder,
  assets,
  labelText,
  className,
  disableTextInput,
  field,
  fieldState,
  onClick,
  onFocus,
  onBlur,
}: InputProps) {
  const errors = fieldState.error as errors | undefined;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disableTextInput) {
      inputRef.current?.focus();
    }
  }, [disableTextInput]);

  const renderErrorMessage = (errors: errors | undefined) => {
    if (!errors) return;
    if (errors?.amount?.message) {
      if (errors?.amount?.message === "Required") return "Amount is required";
      return errors?.amount?.message;
    }
    if (errors?.asset?.message) {
      return `Asset ${errors?.asset?.message}`;
    }
  };

  return (
    <div className={"relative z-10 w-full  " + className} aria-disabled>
      <Input
        ref={inputRef}
        placeholder={placeholder || "0"}
        labelText={labelText}
        className=" z-20 "
        disabled={disabled || disableTextInput}
        onBlur={() => {
          onBlur && onBlur();
          field.onBlur();
        }}
        value={field.value.amount}
        errorMessage={renderErrorMessage(errors)}
        onFocus={() => onFocus && onFocus()}
        onChange={(amount: string) => {
          if (disableTextInput) return;

          field.onChange({
            asset: field.value.asset,
            amount: Number(amount),
          });
          field.onBlur();
          onChange && onChange();
        }}
        type="number"
      />
      {disableTextInput && (
        <div
          onClick={() => {
            onClick && onClick();
            // focuses the input
          }}
          className=" absolute left-0 top-0 z-0 h-full w-full bg-black  opacity-0"
        ></div>
      )}

      <div className="absolute right-2 top-1/2 flex -translate-y-1/2 space-x-2">
        {assets && (
          <DropDown
            className="w-52"
            // TODO: change description
            description="something"
            options={assets}
            onSelectOption={(option) => {
              field.onChange({
                asset: option.value as string,
                amount: Number(field.value.amount),
              });
              onChange && onChange();
            }}
            value={field.value.asset}
            customSelectedItemComponent={(option) => {
              return (
                <div className="flex flex-row items-center space-x-3">
                  {!option ? (
                    <span>Select</span>
                  ) : (
                    <>
                      <img
                        className="h-6 w-6"
                        src={(option as AssetOption).image}
                        alt={option?.label}
                      />
                      <span>{option?.label}</span>
                    </>
                  )}
                </div>
              );
            }}
            customItemComponent={(option, selectedOption, handleOption) => (
              <li
                className={cn(
                  " hover:bg-background-primary-hover flex cursor-pointer flex-row space-x-3 p-3",
                  option.value === selectedOption?.value && "bg-gray-600 ",
                  option.disabled &&
                    "cursor-not-allowed opacity-50 hover:bg-gray-600",
                )}
                onClick={handleOption}
                key={option.value}
              >
                <img
                  src={(option as AssetOption).image}
                  alt="asset"
                  className="h-6 w-6 "
                />
                <span>
                  {option.label} {option.disabled ? "soon" : ""}
                </span>
              </li>
            )}
          />
        )}
      </div>
    </div>
  );
}
