import { DropDown } from "@/components/dropdown/dropdown";
import { InputContainer } from "@/ui/container";
import React from "react";

import { BaseInput } from "../input";
export function BalanceInput() {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const handleClick = () => {
    inputRef.current?.focus();
  };

  return (
    <InputContainer
      label="Balance"
      labelClassname="text-white"
      onClick={handleClick}
    >
      <div className="flex flex-row">
        <BaseInput ref={inputRef} onChange={undefined} />
        <DropDown description="somedescription" options={[]} />
      </div>
      <div className="text-white">aaa</div>
    </InputContainer>
  );
}
