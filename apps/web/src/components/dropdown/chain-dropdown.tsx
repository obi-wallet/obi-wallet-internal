"use client";

import { useStore } from "@/contexts";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { cn } from "@/lib/utils";
import { TargetChainId } from "@/target-chain";
import { observer } from "mobx-react-lite";

import { DropDown } from "./dropdown";

export const ChainDropdown = observer(function ChainDropdown({
  onChange,
  chainId,
}: {
  chainId: TargetChainId;
  onChange: (chainId: TargetChainId) => void;
}) {
  const wallet = useCurrentWallet({});
  const { targetChainsStore } = useStore();

  if (!wallet) {
    return null;
  }

  const chainOptions = targetChainsStore
    .getTargetChains(wallet.userEntryAddress)
    .map((chain) => {
      return {
        label: chain.targetChain.label,
        value: chain.id,
        image: chain.targetChain.image,
        disabled: !chain.enabled,
      };
    })
    .filter((chain) => {
      return !chain.disabled;
    });

  return (
    <div className="flex w-full flex-row">
      <DropDown
        options={chainOptions}
        value={chainId}
        description="Select chain"
        className="relative z-10 w-full"
        onSelectOption={(option) => {
          onChange(option.value);
        }}
        customSelectedItemComponent={(option) => {
          return (
            <div className="flex flex-row items-center space-x-3">
              {!option ? (
                <span>Select</span>
              ) : (
                <>
                  <img
                    className="h-6 w-6"
                    src={option.image}
                    alt={option?.label}
                  />
                  <span>{option?.label}</span>
                </>
              )}
            </div>
          );
        }}
        customItemComponent={(option, selectedOption, handleOption) => {
          return (
            <li
              className={cn(
                " hover:bg-background-primary-hover flex cursor-pointer flex-row space-x-3 p-3",
                option.value === selectedOption?.value && "bg-gray-600 ",
                option.disabled &&
                  "cursor-not-allowed opacity-50 hover:bg-gray-600",
              )}
              onClick={handleOption}
              key={option.value}
            >
              <img src={option.image} alt="asset" className="h-6 w-6 " />
              <span>{option.label}</span>
            </li>
          );
        }}
      />
    </div>
  );
});
