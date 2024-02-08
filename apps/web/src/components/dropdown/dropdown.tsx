"use client";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";

export interface IDropDownOption<T extends string | number> {
  value: T;
  label: string;
  disabled?: boolean;
}

export function DropDown<T extends string | number>({
  description,
  options,
  onSelectOption,
  customItemComponent,
  customSelectedItemComponent,
  value,
  className,
}: {
  description: string;
  options: IDropDownOption<T>[];
  onSelectOption?: (option: IDropDownOption<T>) => void;
  value?: T;
  customSelectedItemComponent?: (option?: IDropDownOption<T>) => JSX.Element;
  customItemComponent?: (
    option: IDropDownOption<T>,
    selectedOption: IDropDownOption<T> | undefined,
    handleOptionClick: () => void,
  ) => JSX.Element;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<
    IDropDownOption<T> | undefined
  >(options?.[0]);

  useEffect(() => {
    setSelectedOption(getOptionFromValue(value));
  }, [value]);
  const getOptionFromValue = (value: string | number | undefined) => {
    if (!value) return undefined;
    return options.find((option) => option.value === value);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOption = (option: IDropDownOption<T>) => {
    if (option.disabled) return;
    setSelectedOption(option);
    setIsOpen(false);

    onSelectOption && onSelectOption(option);
  };

  return (
    <div ref={ref} className={className}>
      <button
        id="dropdownDefaultButton"
        data-dropdown-toggle="dropdown"
        className="  bg-background-primary hover:bg-background-primary-hoverfocus:outline-none relative z-10 flex w-full items-center justify-between rounded px-5 py-2.5 text-center font-medium text-white "
        type="button"
        onClick={() => setIsOpen(!isOpen)}
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
            "z-1000 absolute right-0 w-full rounded-lg bg-gray-700 shadow",
          )}
        >
          <ul
            className="  py-2 text-sm text-gray-700 dark:text-gray-200"
            aria-labelledby="dropdownDefaultButton"
          >
            {options.map((option) =>
              customItemComponent ? (
                customItemComponent(option, selectedOption, () =>
                  handleClickOption(option),
                )
              ) : (
                <li
                  key={`dropdown-${option.value}`}
                  onClick={() => handleClickOption(option)}
                  className={cn(
                    "block cursor-pointer px-4 py-2 hover:bg-gray-600",
                    option.value === selectedOption?.value && "bg-gray-600 ",
                    option.disabled && "cursor-not-allowed opacity-50",
                  )}
                >
                  {option.label}
                </li>
              ),
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
