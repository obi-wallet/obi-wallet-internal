"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { IconType } from "react-icons";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";

import { Text } from "../text";
import Image from "next/image";

export interface IAssetOption {
  image: string;
  label: string;
  value: string;
}

export function AssetsDropDown({
  options,
  onSelectOption,
}: {
  options: IAssetOption[];
  onSelectOption?: (option: IAssetOption) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<
    IAssetOption | undefined
  >(options?.[0]);
  console.log({ options });
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

  const handleClickOption = (option: IAssetOption) => {
    setSelectedOption(option);
    setIsOpen(false);

    onSelectOption && onSelectOption(option);
  };

  console.log({ selectedOption });

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
            <Image
              alt={selectedOption.label}
              src={selectedOption.image}
              style={{ width: 24, height: 24 }}
            />
          )}
          <div className="flex flex-col space-y-2">
            <Text>{selectedOption?.label}</Text>
            {/* <Text>{`${selectedOption?.balance} ${selectedOption?.assetUnit}`}</Text> */}
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
              key={`dropdown-${option.label}`}
              onClick={() => handleClickOption(option)}
              className={cn(
                " px-4 py-2 hover:bg-gray-600 ",
                option.label === selectedOption?.label && "bg-gray-600 ",
              )}
            >
              <div className="flex items-center space-x-3">
                <Image
                  alt={option.label}
                  src={option.image}
                  style={{ width: 24, height: 24 }}
                />
                <div className="flex flex-col space-y-2">
                  <Text>{option.label}</Text>
                  {/* <Text>{`${option.balance} ${option.assetUnit}`}</Text> */}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
