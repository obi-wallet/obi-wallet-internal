import { cn } from "@/lib/utils";
import { BaseInput } from "@/ui/input";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { AssetInfo } from "@obi-wallet/sdk-asset-registry";
import { Caip19AssetId } from "@obi-wallet/sdk-caip";
import Fuse from "fuse.js";
import { useEffect, useRef, useState } from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";

export interface FuseItem {
  id: Caip19AssetId;
  chainInfo: { name: string; image: string };
  assetInfo: AssetInfo;
}

export interface AssetDropdownProps {
  items: FuseItem[];
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
  const [selectedAsset, setSelectedAsset] = useState<FuseItem | null>(() => {
    return (
      items.find((item) => {
        return item.id === selectedItem;
      }) ?? null
    );
  });
  const fuseRef = useRef<Fuse<FuseItem> | null>(null);

  useEffect(() => {
    if (items.length > 0) {
      fuseRef.current = new Fuse(items, {
        keys: ["assetInfo.name", "chainInfo.name"],
        threshold: 0.3, // Adjust the threshold as needed
      });
    }
  }, [items]);
  const [filteredAssets, setFilteredAssets] = useState<FuseItem[]>(items);

  return (
    <Combobox
      immediate
      value={selectedAsset}
      virtual={{ options: filteredAssets }}
      onChange={(asset) => {
        setSelectedAsset(asset);
        onSelectedItemChange?.(asset?.id ?? null);
      }}
      onClose={() => {
        setFilteredAssets(items);
      }}
    >
      <div className="flex flex-row">
        <ComboboxInput
          aria-label="Asset"
          as={BaseInput}
          placeholder={placeholder}
          displayValue={(asset: FuseItem | null) => {
            if (!asset) {
              return "";
            }
            return `${asset.assetInfo.symbol.toUpperCase()} (on ${asset.chainInfo.name})`;
          }}
          onChange={(event) => {
            const query = event.target.value;
            if (query.length === 0) {
              setFilteredAssets(items);
            } else {
              setFilteredAssets(
                fuseRef.current?.search(query).map((result) => {
                  return result.item;
                }) ?? [],
              );
            }
          }}
        />
        <ComboboxButton className="p-2">
          {({ open }) => {
            return open ? <FaAngleUp /> : <FaAngleDown />;
          }}
        </ComboboxButton>
        <ComboboxOptions
          anchor="bottom"
          className="bg-background-main w-[var(--input-width)] border border-[#32c9af] empty:invisible"
        >
          {({ option: asset }) => {
            return (
              <ComboboxOption value={asset} className="w-[var(--input-width)]">
                {({ focus, selected }) => {
                  return (
                    <div
                      className={cn(
                        "hover:bg-background-primary-hover flex w-full cursor-pointer flex-row space-x-3 p-3",
                        {
                          "bg-background-primary-hover": focus,
                          "bg-gray-600": selected,
                        },
                      )}
                    >
                      <div className="flex items-center justify-center">
                        <img
                          src={asset.assetInfo.image}
                          alt={asset.assetInfo.symbol}
                          width={24}
                          height={24}
                        />
                      </div>
                      <div className="text-white">
                        <div>{asset.assetInfo.symbol}</div>
                        <div>{asset.chainInfo.name}</div>
                      </div>
                    </div>
                  );
                }}
              </ComboboxOption>
            );
          }}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
}
