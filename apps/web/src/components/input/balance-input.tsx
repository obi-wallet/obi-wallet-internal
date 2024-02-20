"use client";

import { observer } from "mobx-react-lite";

import { Input } from "./input";
import { BalanceDropDown, IBalanceOption } from "../dropdown";

export interface BalanceInputValue {
  amount: string;
  asset?: IBalanceOption;
}

export interface BalanceInputProps {
  balances: IBalanceOption[];
  value: BalanceInputValue;
  onChange(value: BalanceInputValue): void;
  showMaxButton?: boolean;
  label?: string;
  disabled?: boolean;
  placeholder?: string;
}

export const BalanceInput = observer<BalanceInputProps>(function BalanceInput({
  balances,
  value,
  onChange,
  disabled,
  placeholder,
  showMaxButton = true,
  label,
}) {
  const selectedBalance = value.asset;
  const setAmount = (amount: string) => {
    onChange({ amount, asset: value.asset });
  };
  const setSelectedBalance = (asset: IBalanceOption) => {
    onChange({ amount: value.amount, asset });
  };

  return (
    <div className="relative w-full" aria-disabled>
      <Input
        placeholder={placeholder}
        className="pr-72 "
        disabled={disabled}
        value={value.amount}
        onChange={(value) => setAmount(value)}
        type="number"
        step={0.001}
        labelText={label}
      />

      <div className="absolute right-2 top-1/2 z-10 flex -translate-y-1/2 space-x-2">
        {showMaxButton && selectedBalance ? (
          <button
            className="h-16 w-20 rounded-xl bg-slate-950 text-white hover:bg-blue-700 focus:outline-none"
            disabled={disabled}
            onClick={() => {
              setAmount(selectedBalance.balance.toString() || "");
            }}
          >
            MAX
          </button>
        ) : null}
        {balances ? (
          <BalanceDropDown
            options={balances}
            onSelectOption={setSelectedBalance}
            selectedOptionProp={selectedBalance}
          />
        ) : null}
      </div>
    </div>
  );
});
