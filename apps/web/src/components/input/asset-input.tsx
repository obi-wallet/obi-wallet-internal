"use client";

import { ComponentPropsWithoutRef, useEffect, useState } from "react";

import { Input } from "./input";
import { BalanceDropDown, DropDown, IBalanceOption } from "../dropdown";

type AssetOption = {
  image: string;
  label: string;
  value: string;
};

type InputProps = {
  assets?: AssetOption[];
  onChange?: (value: number) => void;
  labelText?: string;
} & ComponentPropsWithoutRef<"input">;

export function AssetInput({
  onChange,
  disabled,
  placeholder,
  assets,
  labelText,
}: InputProps) {
  const [amount, setAmount] = useState(0);
  const [text, setText] = useState("");
  // const [selectedAsset, setSelectedAsset] = useState(assets?.[0]);
  console.log({ assets });
  useEffect(() => {
    setAmount(parseFloat(text) || 0);
  }, [text]);
  useEffect(() => {
    onChange && onChange(amount);
  }, [amount, onChange]);

  return (
    <div className="relative z-10 w-full" aria-disabled>
      <Input
        placeholder={placeholder}
        labelText={labelText}
        className="pr-72 "
        disabled={disabled}
        value={text}
        onChange={(e) => setText(e.target.value)}
        type="number"
        step={0.001}
      />

      <div className="index  absolute right-2 top-1/2 z-10 flex -translate-y-1/2 space-x-2">
        {assets && (
          <DropDown
            description="something"
            options={assets}
            onSelectOption={(option) => console.log({ option })}
          />
        )}
      </div>
    </div>
  );
}
