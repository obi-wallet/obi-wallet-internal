"use client";

import { ComponentPropsWithoutRef, useEffect, useState } from "react";

import { Input } from "./input";
import { BalanceDropDown, IBalanceOption } from "../dropdown";

type InputProps = {
  balances: IBalanceOption[];
  onChange?: (value: number) => void;
} & ComponentPropsWithoutRef<"input">;

export function BalanceInput({
  onChange,
  disabled,
  placeholder,
  balances,
}: InputProps) {
  const [amount, setAmount] = useState(0);
  const [text, setText] = useState("");
  const [selectedBalance, setSelectedBalance] = useState(balances?.[0]);

  useEffect(() => {
    setAmount(parseFloat(text) || 0);
  }, [text]);
  useEffect(() => {
    onChange && onChange(amount);
  }, [amount, onChange]);

  const handleClickMax = () => {
    setText(selectedBalance?.balance.toString() || "");
  };

  return (
    <div className="relative w-full" aria-disabled>
      <Input
        placeholder={placeholder}
        className="pr-72 "
        disabled={disabled}
        value={text}
        onChange={(e) => setText(e.target.value)}
        type="number"
        step={0.001}
      />

      <div className="absolute right-2 top-1/2 z-10 flex -translate-y-1/2 space-x-2">
        <button
          className="h-16 w-20 rounded-xl bg-slate-950 text-white hover:bg-blue-700 focus:outline-none"
          disabled={disabled}
          onClick={handleClickMax}
        >
          MAX
        </button>
        {balances && (
          <BalanceDropDown
            options={balances}
            onSelectOption={setSelectedBalance}
          />
        )}
      </div>
    </div>
  );
}
