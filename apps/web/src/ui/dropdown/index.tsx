import { cn } from "@/lib/utils";
import Downshift from "downshift";
import {
  RefObject,
  useRef,
  useState,
  useEffect,
  FC,
  CSSProperties,
  HTMLAttributes,
} from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";

export interface DropdownItem {
  disabled?: boolean | undefined;
}

export interface CustomDropdownProps<T extends DropdownItem> {
  items: T[];
  itemToString: (item: T | null) => string;
  itemComponent: FC<ItemComponentProps<T>>;
  onItemSelect: (item: T) => void;
  selectedItemComponent: FC<{ item: T | null }>;
  getKey?: (item: T) => string;
  className?: string;
  selectedItem: T | null;
  selectedItemClassname?: string;
}

export interface ItemComponentProps<T extends DropdownItem> {
  item: T;
  getItemProps: (options: {
    item: T;
    index?: number;
    disabled?: boolean;
    style?: CSSProperties;
  }) => HTMLAttributes<HTMLDivElement>;
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
  selectedItemClassname,
}: CustomDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, () => {
    return setIsOpen(false);
  });

  return (
    <div ref={ref} className="flex flex-1">
      <Downshift
        onChange={(selection) => {
          if (!selection) return;
          onItemSelect(selection);
          setIsOpen(false); // Close dropdown after selection
        }}
        onOuterClick={() => {
          return setIsOpen(false);
        }}
        itemToString={itemToString}
        selectedItem={selectedItem}
      >
        {({ getItemProps, selectedItem }) => {
          return (
            <div className={cn("relative z-10", className)}>
              <button
                id="dropdownDefaultButton"
                data-dropdown-toggle="dropdown"
                className={cn(
                  "bg-background-primary hover:bg-background-primary-hover relative z-10 flex w-full items-center justify-between rounded px-5 py-2.5 text-center font-medium text-white focus:outline-none",
                  selectedItemClassname,
                )}
                onClick={() => {
                  return setIsOpen(!isOpen);
                }}
              >
                <SelectedItemComponent item={selectedItem} />

                <div className="ml-3">
                  {isOpen ? <FaAngleUp /> : <FaAngleDown />}
                </div>
              </button>
              {isOpen && (
                <div className="z-1000 absolute right-0 w-full overflow-hidden rounded-b-lg bg-gray-700 shadow">
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
          );
        }}
      </Downshift>
    </div>
  );
}

function useOutsideClick(ref: RefObject<HTMLElement>, callback: () => void) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
}
