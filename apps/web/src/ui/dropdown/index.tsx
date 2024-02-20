"use client";

import { cn } from "@/lib/utils";
import Downshift from "downshift";
import { useState } from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
export interface DropdownItem {
  disabled?: boolean;
}

export interface CustomDropdownProps<T extends DropdownItem> {
  items: T[];
  itemToString: (item: T | null) => string;
  itemComponent: React.FC<ItemComponentProps<T>>;
  onItemSelect: (item: T) => void;
  selectedItemComponent: React.FC<{ item: T }>;
  getKey?: (item: T) => string;
  className?: string;
  selectedItem?: T;
}

export interface ItemComponentProps<T extends DropdownItem> {
  item: T;
  getItemProps: (options: {
    item: T;
    index?: number;
    disabled?: boolean;
    style?: React.CSSProperties;
  }) => React.HTMLAttributes<HTMLDivElement>;
  isSelected: boolean;
}

export function CustomDropdown<T extends DropdownItem>({
  items,
  itemComponent: ItemComponent,
  itemToString,
  onItemSelect,
  selectedItemComponent: SelectedItemComponent,
  getKey,
  className,
  selectedItem,
}: CustomDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Downshift
      onChange={(selection) => {
        onItemSelect(selection as T);
        setIsOpen(false); // Close dropdown after selection
      }}
      itemToString={itemToString}
      selectedItem={selectedItem}
    >
      {({ getItemProps, selectedItem }) => (
        <div className={cn("relative z-10", className)}>
          <button
            id="dropdownDefaultButton"
            data-dropdown-toggle="dropdown"
            className="bg-background-primary hover:bg-background-primary-hoverfocus:outline-none relative z-10 flex w-full items-center justify-between rounded px-5 py-2.5 text-center font-medium text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            <SelectedItemComponent item={selectedItem as T} />
            <div className="ml-3">
              {isOpen ? <FaAngleUp /> : <FaAngleDown />}
            </div>
          </button>
          {isOpen && (
            <div className="z-1000  absolute right-0 w-full rounded-lg bg-gray-700 shadow">
              {items.map((item, index) => {
                return (
                  <ItemComponent
                    key={getKey ? getKey(item) : index.toString()}
                    item={item}
                    getItemProps={getItemProps}
                    isSelected={selectedItem === item}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </Downshift>
  );
}
