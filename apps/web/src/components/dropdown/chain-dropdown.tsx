"use client";

import { useStore } from "@/contexts";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { cn } from "@/lib/utils";
import { isTargetChainId, TargetChainId } from "@/target-chain";
import { observer } from "mobx-react-lite";

import { DropDown } from "./dropdown";

export function useChainOptions() {
  const wallet = useCurrentWallet();
  const { targetChainsStore } = useStore();

  if (!wallet) {
    return {
      options: [],
      initialValue: null,
      setLastUsedTargetChainId: () => {},
    };
  }

  const options = targetChainsStore
    .getTargetChains(wallet.id)
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
    })
    .sort((a, b) => {
      return a.label.localeCompare(b.label);
    });

  const getInitialValue = (): TargetChainId | null => {
    const lastUsedChainId = targetChainsStore.getLastUsedTargetChainId(
      wallet.id,
    );
    if (lastUsedChainId && isTargetChainId(lastUsedChainId)) {
      return lastUsedChainId;
    }

    const chainId = options[0]?.value;
    if (chainId) {
      return chainId;
    }

    return null;
  };

  return {
    options,
    initialValue: getInitialValue(),
    setLastUsedTargetChainId: (chainId: TargetChainId) => {
      targetChainsStore.setLastUsedTargetChainId({
        id: wallet.id,
        chainId,
      });
    },
  };
}

export const ChainDropdown = observer(function ChainDropdown({
  onChange,
  chainId,
  className,
}: {
  chainId: TargetChainId | null;
  onChange: (chainId: TargetChainId) => void;
  className?: string;
}) {
  const { options, setLastUsedTargetChainId } = useChainOptions();

  return (
    <div className="flex w-full">
      <DropDown
        options={options}
        value={chainId ?? undefined}
        description="Select chain"
        className={cn("w-full bg-transparent", className)}
        contentContainerClassname="z-[1000]"
        onSelectOption={(option) => {
          setLastUsedTargetChainId(option.value);
          onChange(option.value);
        }}
        customSelectedItemComponent={(option) => {
          return (
            <div className="flex w-full items-center justify-between">
              {!option ? (
                <span>Select</span>
              ) : (
                <>
                  <div className="flex items-center space-x-3">
                    <img
                      className="chain-icon"
                      src={option.image}
                      alt={option.label}
                    />
                    <span>{option.label}</span>
                  </div>
                  <span>{chainId}</span>
                </>
              )}
            </div>
          );
        }}
        customItemComponent={(option, selectedOption, handleOption) => {
          return (
            <li
              className={cn(
                "chain-dropdown-item",
                option.value === selectedOption?.value &&
                  "chain-dropdown-item-selected",
                option.disabled && "chain-dropdown-item-disabled",
              )}
              onClick={handleOption}
              key={option.value}
            >
              <img src={option.image} alt="asset" className="chain-icon" />
              <span>{option.label}</span>
            </li>
          );
        }}
      />
    </div>
  );
});
