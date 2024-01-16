"use client";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { FaAngleDown } from "react-icons/fa6";

export interface IDropDownOption {
  value: string | number;
  label: string;
}

export function DropDown({
  description,
  options,
  onSelectOption,
}: {
  description: string;
  options: IDropDownOption[];
  onSelectOption?: (option: IDropDownOption) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<
    IDropDownOption | undefined
  >(options?.[0]);

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

  const handleClickOption = (option: IDropDownOption) => {
    setSelectedOption(option);
    setIsOpen(false);

    onSelectOption && onSelectOption(option);
  };

  return (
    <div ref={ref}>
      {!isOpen && (
        <button
          id="dropdownDefaultButton"
          data-dropdown-toggle="dropdown"
          className="flex w-full items-center justify-between rounded bg-blue-600 px-5 py-2.5 text-center font-medium text-white hover:bg-blue-700 focus:outline-none "
          type="button"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedOption?.label || description}
          <FaAngleDown />
        </button>
      )}

      <div
        id="dropdown"
        className={cn(
          "z-10 divide-y divide-gray-100 rounded-lg  bg-gray-700 shadow",
          !isOpen && "hidden",
        )}
      >
        <ul
          className="cursor-pointer py-2 text-sm text-gray-700 dark:text-gray-200"
          aria-labelledby="dropdownDefaultButton"
        >
          {options.map((option) => (
            <li
              key={`dropdown-${option.value}`}
              onClick={() => handleClickOption(option)}
              className={cn(
                "block px-4 py-2 hover:bg-gray-600 ",
                option.value === selectedOption?.value && "bg-gray-600 ",
              )}
            >
              {option.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
