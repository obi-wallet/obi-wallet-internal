"use client";

import { cn } from "@/lib/utils";
import { TargetChainId } from "@/target-chain";
import { Asset } from "@chain-registry/types";
import BigNumber from "bignumber.js";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";

import { Text } from "../text";

export interface IBalanceOption {
  image: string | undefined;
  targetChainId: TargetChainId;
  denom: string;
  network: string;
  assetUnit: string;
  balance: BigNumber;
  asset: Asset;
  disabled?: boolean;
}

export const BalanceDropDown = observer<{
  options: IBalanceOption[];
  selectedOptionProp?: IBalanceOption;
  onSelectOption?: (option: IBalanceOption) => void;
}>(function BalanceDropDown({ options, onSelectOption, selectedOptionProp }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<
    IBalanceOption | undefined
  >();

  // check if selectedOptionProp is equal to selectedOption
  useEffect(() => {
    if (selectedOptionProp) {
      if (selectedOptionProp !== selectedOption) {
        setSelectedOption(selectedOptionProp);
      }
    }
  }, [selectedOptionProp]);

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
        className="bg-background-primary hover:bg-background-primary-hover flex h-16 w-full items-center justify-between rounded-xl p-3 text-center font-medium text-white focus:outline-none "
        type="button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex min-w-[50px] items-center space-x-3">
          {selectedOption && (
            <Image
              src={selectedOption.image ?? "  "}
              alt={selectedOption.network}
              width={24}
              height={24}
            />
          )}
          <div className="flex flex-col space-y-2">
            {selectedOption ? (
              <>
                <Text size="xs">{selectedOption?.network}</Text>
                <Text size="xs">{`${selectedOption?.balance} ${selectedOption?.assetUnit}`}</Text>
              </>
            ) : (
              <Text size="md" className="  ml-7 mr-7">
                Select
              </Text>
            )}
          </div>
          <div className="ml-3">{isOpen ? <FaAngleUp /> : <FaAngleDown />}</div>
        </div>
      </button>

      <div
        id="dropdown"
        className={cn(
          "absolute z-50 w-full rounded-lg bg-gray-700",
          !isOpen && "hidden",
        )}
      >
        <ul
          className="z-50 cursor-pointer py-2 text-sm text-gray-700 dark:text-gray-200"
          aria-labelledby="dropdownDefaultButton"
        >
          {options.map((option) => (
            <li
              key={`dropdown-${option.network}-${option.asset.base}`}
              onClick={() => handleClickOption(option)}
              className={cn(
                " px-4 py-2 hover:bg-gray-600 ",
                option.network === selectedOption?.network && "bg-gray-600 ",
              )}
            >
              <div className="flex items-center space-x-3">
                <Image
                  src={option.image ?? "  "}
                  alt={option.network}
                  width={24}
                  height={24}
                />
                <div className="flex flex-col space-y-2">
                  <Text size="xs">{option.network}</Text>
                  <Text size="xs">{`${option.balance} ${option.assetUnit}`}</Text>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});
