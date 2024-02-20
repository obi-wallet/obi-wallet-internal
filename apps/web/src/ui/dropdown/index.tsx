"use client";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
import Downshift from "downshift";
export interface DropdownItem {
  disabled?: boolean;
}

export interface CustomDropdownProps<T extends DropdownItem> {
  items: T[];
  itemComponent: React.FC<ItemComponentProps<T>>;
  onItemSelect: (item: T) => void;
  selectedItemComponent: React.FC<T>;
}

export interface ItemComponentProps<T extends DropdownItem> {
  item: T;
  getItemProps: (options: any) => any;
  isSelected: boolean;
}

export function CustomDropdown<T extends DropdownItem>({
  items,
  itemComponent: ItemComponent,
  onItemSelect,
  selectedItemComponent: SelectedItemComponent,
}: CustomDropdownProps<T>) {
  //   const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  //   const [selectedOption, setSelectedOption] = useState<
  //     IDropDownOption<T> | undefined
  //   >(options?.[0]);

  //   useEffect(() => {
  //     setSelectedOption(getOptionFromValue(value));
  //   }, [value]);
  //   const getOptionFromValue = (value: string | number | undefined) => {
  //     if (!value) return undefined;
  //     return options.find((option) => option.value === value);
  //   };

  //   useEffect(() => {
  //     const handleClickOutside = (event: MouseEvent) => {
  //       if (ref.current && !ref.current.contains(event.target as Node)) {
  //         setIsOpen(false);
  //       }
  //     };

  //     document.addEventListener("mousedown", handleClickOutside);

  //     return () => {
  //       document.removeEventListener("mousedown", handleClickOutside);
  //     };
  //   }, []);

  //   const handleClickOption = (option: IDropDownOption<T>) => {
  //     if (option.disabled) return;
  //     setSelectedOption(option);
  //     setIsOpen(false);

  //     onSelectOption && onSelectOption(option);
  //   };

  return (
    <Downshift
      onChange={(selection) => {
        onItemSelect(selection as T);
        setIsOpen(false); // Close dropdown after selection
      }}
      itemToString={(item) => (item ? item.text : "")}
    >
      {({ getItemProps, selectedItem }) => (
        <div className={cn("relative z-10")}>
          <button
            id="dropdownDefaultButton"
            data-dropdown-toggle="dropdown"
            className="  bg-background-primary hover:bg-background-primary-hoverfocus:outline-none relative z-10 flex w-full items-center justify-between rounded px-5 py-2.5 text-center font-medium text-white "
            onClick={() => setIsOpen(!isOpen)}
          >
            {selectedItem ? (
              <SelectedItemComponent
                item={selectedItem as T} // Cast the selectedItem to type T
                getItemProps={getItemProps}
                isSelected={false}
              />
            ) : (
              "Select"
            )}
            <div className="ml-3">
              {isOpen ? <FaAngleUp /> : <FaAngleDown />}
            </div>
          </button>
          {isOpen && (
            <div
              //   style={{
              //     border: "1px solid #ccc",
              //     position: "absolute",
              //   }}
              className="absolute right-0"
            >
              {items.map((item, index) => (
                <ItemComponent
                  key={item.value}
                  item={item}
                  getItemProps={getItemProps}
                  isSelected={selectedItem === item}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </Downshift>
  );
}
