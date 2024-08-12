import { DropDown } from "@/components/dropdown/dropdown";
import { useRef } from "react";

import { Input } from "../input";

export function BalanceInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div>
      <Input
        label="Balance"
        labelClassname="bg-black"
        onClick={handleClick}
        rightComponent={
          <DropDown
            description="Select"
            options={[
              {
                label: "a",
                value: "a",
              },
              {
                label: "b",
                value: "b",
              },
            ]}
          />
        }
      >
        <div className="flex flex-row items-center gap-2 text-xs text-white">
          <div className="rounded-sm border-2 border-blue-700 p-1">25%</div>
          <div>50%</div>
          <div>75%</div>
          <div>100%</div>
        </div>
      </Input>
    </div>
  );
}
