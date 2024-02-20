import { Divider } from "@/components/divider";
import { InputContainer } from "@/ui/container";
import { BaseInput } from "@/ui/input/base-input";
import {
  DetailedHTMLProps,
  InputHTMLAttributes,
  ReactNode,
  useRef,
} from "react";

export interface InputProps
  extends Omit<
    DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
    "onChange"
  > {
  label: string;
  labelClassname?: string;
  onChange?: (value: string) => void;
  containerClassName?: string;
  inputClassName?: string;
  leftComponent?: ReactNode;
  rightComponent?: ReactNode;
  topComponent?: ReactNode;
}

export function Input({
  labelClassname,
  label,
  onChange,
  inputClassName,
  className,
  leftComponent,
  rightComponent,
  topComponent,
  children,
  ...rest
}: InputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

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
      <div className="flex flex-1 flex-col">
        {topComponent && <>{topComponent}</>}
        <div className="flex flex-1 flex-row items-center">
          {leftComponent && <div>{leftComponent}</div>}
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
            className={"w-full flex-1" + inputClassName}
          />
          {rightComponent && <div>{rightComponent}</div>}
        </div>
        {children && (
          <>
            <Divider className="mb-2 mt-2" />
            {children}
          </>
        )}
      </div>
    </InputContainer>
  );
}
