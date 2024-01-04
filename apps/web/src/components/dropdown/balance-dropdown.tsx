"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { IconType } from "react-icons";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";

import { Text } from "../text";

export interface IBalanceOption {
  icon: IconType;
  network: string;
  assetUnit: string;
  balance: number;
}

export function BalanceDropDown({
  options,
  onSelectOption,
}: {
  options: IBalanceOption[];
  onSelectOption?: (option: IBalanceOption) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<
    IBalanceOption | undefined
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

  const handleClickOption = (option: IBalanceOption) => {
    setSelectedOption(option);
    setIsOpen(false);

    onSelectOption && onSelectOption(option);
  };

  return (
    <div ref={ref} className="relative z-50">
      <button
        id="dropdownDefaultButton"
        data-dropdown-toggle="dropdown"
        className="flex h-16 w-full items-center justify-between rounded-xl bg-slate-950 p-3 text-center font-medium text-white hover:bg-blue-700 focus:outline-none "
        type="button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-3">
          {selectedOption && (
            <selectedOption.icon style={{ width: 24, height: 24 }} />
          )}
          <div className="flex flex-col space-y-2">
            <Text>{selectedOption?.network}</Text>
            <Text>{`${selectedOption?.balance} ${selectedOption?.assetUnit}`}</Text>
          </div>
          <div className="ml-3">{isOpen ? <FaAngleUp /> : <FaAngleDown />}</div>
        </div>
      </button>

      <div
        id="dropdown"
        className={cn(
          "absolute z-50 w-full  rounded-lg bg-gray-700",
          !isOpen && "hidden",
        )}
      >
        <ul
          className="z-50 cursor-pointer py-2 text-sm text-gray-700 dark:text-gray-200"
          aria-labelledby="dropdownDefaultButton"
        >
          {options.map((option) => (
            <li
              key={`dropdown-${option.network}`}
              onClick={() => handleClickOption(option)}
              className={cn(
                " px-4 py-2 hover:bg-gray-600 ",
                option.network === selectedOption?.network && "bg-gray-600 ",
              )}
            >
              <div className="flex items-center space-x-3">
                <option.icon style={{ width: 24, height: 24 }} />
                <div className="flex flex-col space-y-2">
                  <Text>{option.network}</Text>
                  <Text>{`${option.balance} ${option.assetUnit}`}</Text>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
