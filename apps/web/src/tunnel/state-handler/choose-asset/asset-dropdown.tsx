import { useAssets } from "@/hooks/assets";
import { cn } from "@/lib/utils";
import { Caip19AssetId } from "@obi-wallet/sdk-caip";
import { useSelect } from "downshift";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";

export interface AssetDropdownProps {
  items: Caip19AssetId[];
  selectedItem?: Caip19AssetId | null;
  onSelectedItemChange?: (item: Caip19AssetId | null) => void;
  placeholder?: string;
}

export function AssetDropdown({
  items,
  selectedItem,
  onSelectedItemChange,
  placeholder = "Select Asset",
}: AssetDropdownProps) {
  const {
    isOpen,
    highlightedIndex,
    getToggleButtonProps,
    getMenuProps,
    getItemProps,
  } = useSelect({
    items,
    selectedItem,
    onSelectedItemChange: (changes) => {
      onSelectedItemChange?.(changes.selectedItem ?? null);
    },
  });
  const assets = useAssets(items);
  const selectedAsset = selectedItem ? assets[selectedItem] : null;

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        className="bg-background-secondary flex h-[48px] w-full items-center justify-between rounded-[5px] px-3 text-white"
        {...getToggleButtonProps()}
      >
        {selectedAsset?.assetInfo?.symbol ?? placeholder}
        <span className="ml-2">{isOpen ? <FaAngleUp /> : <FaAngleDown />}</span>
      </button>

      <ul
        className={cn(
          "bg-background-main absolute right-0 z-50 w-full",
          isOpen ? "block" : "hidden",
        )}
        {...getMenuProps()}
      >
        {isOpen &&
          items.map((item, index) => {
            const isHighlighted = highlightedIndex === index;
            const isSelected = selectedItem === item;

            return (
              <li
                key={item}
                className={cn(
                  "cursor-pointer px-3 py-2 text-white",
                  "hover:bg-background-hover",
                  {
                    "bg-background-hover": isHighlighted,
                    "font-bold": isSelected,
                  },
                )}
                {...getItemProps({ item, index })}
              >
                {assets[item]?.assetInfo?.symbol ?? item}
              </li>
            );
          })}
      </ul>
    </div>
  );
}
