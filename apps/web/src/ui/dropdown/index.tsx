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
    <div ref={ref} className="obi-dropdown flex flex-1">
      <Downshift
        onChange={(selection) => {
          if (!selection) return;
          onItemSelect(selection);
          setIsOpen(false);
        }}
        onOuterClick={() => {
          return setIsOpen(false);
        }}
        itemToString={itemToString}
        selectedItem={selectedItem}
      >
        {({ getItemProps, selectedItem }) => {
          return (
            <div
              className={cn("obi-dropdown-container relative z-10", className)}
            >
              <button
                id="dropdownDefaultButton"
                data-dropdown-toggle="dropdown"
                className={cn(
                  "obi-dropdown-button hover:bg-background-primary-hover relative z-10 flex w-full items-center justify-between rounded bg-transparent px-5 py-2.5 text-center font-medium text-white focus:outline-none",
                  selectedItemClassname,
                )}
                onClick={() => {
                  return setIsOpen(!isOpen);
                }}
              >
                <div className="obi-dropdown-selected">
                  <SelectedItemComponent item={selectedItem} />
                </div>

                <div className="obi-dropdown-icon ml-3">
                  {isOpen ? <FaAngleUp /> : <FaAngleDown />}
                </div>
              </button>
              {isOpen && (
                <div className="obi-dropdown-menu z-1000 absolute right-0 w-full overflow-hidden rounded-b-lg bg-gray-700 shadow">
                  <div className="obi-dropdown-items">
                    {items.map((item, index) => {
                      return (
                        <div
                          key={getKey ? getKey(item) : index.toString()}
                          className="obi-dropdown-item"
                        >
                          <ItemComponent
                            item={item}
                            getItemProps={getItemProps}
                            isSelected={selectedItem === item}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        }}
      </Downshift>
    </div>
  );
}

function useOutsideClick(
  ref: RefObject<HTMLElement | null>,
  callback: () => void,
) {
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
