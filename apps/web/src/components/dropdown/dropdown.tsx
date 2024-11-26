"use client";

import { cn } from "@/lib/utils";
import { ReactNode, useEffect, useRef, useState, type JSX } from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";

export interface DropDownOption<T extends string | number> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface DropDownProps<
  T extends string | number,
  O extends DropDownOption<T>,
> {
  description: string;
  options: O[];
  onSelectOption?: (option: O) => void;
  value?: T | undefined;
  customSelectedItemComponent?: (option?: O) => JSX.Element;
  customItemComponent?: (
    option: O,
    selectedOption: O | undefined,
    handleOptionClick: () => void,
  ) => ReactNode;
  className?: string;
  contentContainerClassname?: string;
  disabled?: boolean;
}

export function DropDown<
  T extends string | number,
  O extends DropDownOption<T>,
>({
  description,
  options,
  onSelectOption,
  customItemComponent,
  customSelectedItemComponent,
  value,
  className,
  contentContainerClassname,
  disabled,
}: DropDownProps<T, O>) {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<O | undefined>(
    options?.[0],
  );

  useEffect(() => {
    setSelectedOption(getOptionFromValue(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  const getOptionFromValue = (value: string | number | undefined) => {
    if (!value) return undefined;
    return options.find((option) => {
      return option.value === value;
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOption = (option: O) => {
    if (option.disabled) return;
    setSelectedOption(option);
    setIsOpen(false);

    if (typeof onSelectOption === "function") {
      onSelectOption(option);
    }
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        id="dropdownDefaultButton"
        data-dropdown-toggle="dropdown"
        className="text-roboto-mono hover:bg-background-primary-hoverfocus:outline-none relative z-10 flex w-full items-center justify-between rounded bg-transparent px-5 py-2.5 text-center font-medium text-white max-sm:px-3"
        type="button"
        disabled={disabled}
        onClick={() => {
          return setIsOpen(!isOpen);
        }}
      >
        {(customSelectedItemComponent &&
          customSelectedItemComponent(selectedOption)) ||
          selectedOption?.label ||
          description}
        {isOpen ? <FaAngleUp /> : <FaAngleDown />}
      </button>

      {isOpen && (
        <div
          id="dropdown"
          className={cn(
            "absolute right-0 z-50 max-h-80 w-full overflow-y-auto rounded-lg bg-gray-700 shadow",
            contentContainerClassname,
          )}
        >
          <ul
            className="py-2 text-sm text-white dark:text-gray-200"
            aria-labelledby="dropdownDefaultButton"
          >
            {options.map((option) => {
              return customItemComponent ? (
                customItemComponent(option, selectedOption, () => {
                  return handleClickOption(option);
                })
              ) : (
                <li
                  key={`dropdown-${option.value}`}
                  onClick={() => {
                    return handleClickOption(option);
                  }}
                  className={cn(
                    "block cursor-pointer px-4 py-2 hover:bg-gray-600",
                    option.value === selectedOption?.value && "bg-gray-600",
                    option.disabled && "cursor-not-allowed opacity-50",
                  )}
                >
                  {option.label}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
