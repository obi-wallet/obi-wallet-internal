"use client";

import { cn } from "@/lib/utils";
import { TargetChainId } from "@/target-chain";
import { Eip155ChainId } from "@/target-chain/eip-155/chains";
import { SolanaChainId } from "@/target-chain/solana/chains";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { FaChevronDown } from "react-icons/fa6";

import { useChainOptions } from "./chain-dropdown";
import { DropDown } from "./dropdown";

export const InlineChainDropdown = observer(function InlineChainDropdown({
  chainId,
  className,
}: {
  chainId: TargetChainId | null;
  className?: string;
}) {
  const router = useRouter();
  const { options } = useChainOptions();
  const filteredOptions = options.filter((opt) => {
    const [protocol, chainId] = (opt.value ?? "").split(":");
    if (!chainId) return true;

    let enumKey = "";
    if (protocol === "eip155") {
      enumKey =
        Object.entries(Eip155ChainId).find(([_, value]) => {
          return value === opt.value;
        })?.[0] ?? "";
    } else if (protocol === "solana") {
      enumKey =
        Object.entries(SolanaChainId).find(([_, value]) => {
          return value === opt.value;
        })?.[0] ?? "";
    }

    return !enumKey.includes("Testnet");
  });
  const selectedOption = filteredOptions.find((opt) => {
    return opt.value === chainId;
  });

  return (
    <span className={cn("inline-flex items-baseline", className)}>
      <DropDown
        options={filteredOptions}
        value={chainId ?? undefined}
        description="Select chain"
        className="!m-0 !border-0 !bg-transparent !p-0 hover:!bg-transparent focus:!ring-0 [&>button]:!m-0 [&>button]:inline-flex [&>button]:items-baseline [&>button]:!p-0"
        contentContainerClassname="absolute left-0 top-full mt-1 min-w-max bg-transparent shadow-none max-h-48 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary/20 [&::-webkit-scrollbar-thumb:hover]:bg-primary/40"
        onSelectOption={(option) => {
          router.push(`/dashboard/transaction/receive/${option.value}`);
        }}
        hideDefaultArrow
        customSelectedItemComponent={(option) => {
          const displayOption = option || selectedOption;
          return (
            <span className="!m-0 inline-flex items-baseline !p-0">
              {!displayOption ? (
                <span className="text-primary underline">Select Chain</span>
              ) : (
                <>
                  <span className="text-primary underline">
                    {displayOption.label}
                  </span>
                  <FaChevronDown className="text-primary ml-0.5 h-3 w-3" />
                </>
              )}
            </span>
          );
        }}
        customItemComponent={(option, selectedOption, handleOption) => {
          return (
            <li
              className={cn(
                "text-primary cursor-pointer px-3 py-1 hover:opacity-80",
                option.value === selectedOption?.value && "opacity-80",
                option.disabled && "cursor-not-allowed opacity-50",
              )}
              onClick={handleOption}
              key={option.value}
            >
              <span>{option.label}</span>
            </li>
          );
        }}
      />
    </span>
  );
});
