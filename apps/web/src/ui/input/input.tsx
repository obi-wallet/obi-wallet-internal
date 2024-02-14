import { InputContainer } from "@/ui/container";
import { BaseInput } from "@/ui/input/base-input";
import React, { DetailedHTMLProps, InputHTMLAttributes } from "react";

export interface InputProps
  extends Omit<
    DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
    "onChange"
  > {
  label: string;
  labelClassname: string;
  onChange?: (value: string) => void;
  containerClassName?: string;
  inputClassName?: string;
}

export function Input({
  labelClassname,
  label,
  onChange,
  inputClassName,
  className,
  ...rest
}: InputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const handleClick = () => {
    inputRef.current?.focus();
  };

  return (
    <InputContainer
      label={label}
      labelClassname={labelClassname}
      className={className}
      onClick={handleClick}
    >
      <BaseInput
        {...rest}
        ref={inputRef}
        onChange={
          onChange
            ? (e) => {
                onChange(e.target.value);
              }
            : undefined
        }
        className={inputClassName}
      />
    </InputContainer>
  );
}
