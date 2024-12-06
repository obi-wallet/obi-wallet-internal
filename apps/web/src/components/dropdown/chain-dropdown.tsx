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
    })
    .sort((a, b) => {
      return a.label.localeCompare(b.label);
    });

  const getInitialValue = (): TargetChainId | null => {
    const lastUsedChainId = targetChainsStore.getLastUsedTargetChainId(
      wallet.userEntryAddress,
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
        address: wallet.userEntryAddress,
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
        onSelectOption={(option) => {
          setLastUsedTargetChainId(option.value);
          onChange(option.value);
        }}
        customSelectedItemComponent={(option) => {
          return (
            <div className="flex w-full items-center">
              {!option ? (
                <span>Select</span>
              ) : (
                <>
                  <div className="flex items-center space-x-3">
                    <img
                      className="h-6 w-6"
                      src={option.image}
                      alt={option.label}
                    />
                    <span>{option.label}</span>
                  </div>
                  <span className="ml-auto">{chainId}</span>
                </>
              )}
            </div>
          );
        }}
        customItemComponent={(option, selectedOption, handleOption) => {
          return (
            <li
              className={cn(
                "hover:bg-background-primary-hover flex cursor-pointer items-center space-x-3 p-3",
                option.value === selectedOption?.value && "bg-gray-600",
                option.disabled &&
                  "cursor-not-allowed opacity-50 hover:bg-gray-600",
              )}
              onClick={handleOption}
              key={option.value}
            >
              <img src={option.image} alt="asset" className="h-6 w-6" />
              <span>{option.label}</span>
            </li>
          );
        }}
      />
    </div>
  );
});
