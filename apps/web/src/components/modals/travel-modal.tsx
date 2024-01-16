"use client";
import { cn } from "@/lib/utils";
import { FaExclamation, FaSketch } from "react-icons/fa6";

import { AssetInput, Box, Button, Input, Text } from "..";
import { IAssetOption, IBalanceOption } from "../dropdown";
import { Divider } from "../divider";

import { useRef, useState } from "react";

import { FromAsset, ToAsset } from "@/app/dashboard/fast-travel/assets";

export function TravelModal({
  fromAssets,
  toAssets,
  targetAsset,
  onDismiss,
}: {
  fromAssets: { [key: string]: FromAsset };
  toAssets: { [key: string]: ToAsset };
  targetAsset?: ToAsset;
  onDismiss?: () => void;
}) {
  const getAssetOptions = (assets: {
    [key: string]: FromAsset | ToAsset;
  }): IAssetOption[] => {
    return Object.entries(assets).map(([key, asset]) => ({
      label: key,
      image: asset.image,
      value: key,
    })) as IAssetOption[];
  };

  return (
    <div className="absolute top-0 flex h-full w-full items-center justify-center rounded-md bg-black/30 backdrop-blur-sm">
      <Box className="w-[560px] space-y-4 pt-6 shadow-lg shadow-neutral-600">
        <Text size="xl">Obi Fast Travel</Text>
        <Text size="sm">
          Deposit assets below from an external account to receive them in your
          Obi account.
        </Text>

        <Divider />

        <AssetInput
          assets={getAssetOptions(fromAssets)}
          placeholder="0.1"
          labelText="Deposit"
        />
        <AssetInput
          assets={getAssetOptions(toAssets)}
          placeholder="0.1"
          labelText="Deposit"
        />

        <div className="space-y-2">
          <Text color="zinc" size="xs">
            Slippage Tolerance
          </Text>
          <div className="mb-10  flex flex-row space-x-3">
            <ToleranceSetting />
          </div>
        </div>
        <Divider />
        <div className="flex-column  flex  bg-black/30 bg-opacity-10 p-5">
          <div
            className="
          aspect-w-1
           aspect-h-1 
           mr-5 flex
           items-center
            justify-center
          rounded-full
          border border-white
          p-2
          "
          >
            <FaExclamation className="yellow m-auto " />
          </div>
          <Text size="sm">
            Execute with Metamask or deposit to the address shown below. You may
            close this dialogue after depositing.
          </Text>
        </div>

        <div className="font-size-[16px] mt-10">
          <Text color="zinc" size="xs">
            Deposit Address
          </Text>
          <div
            className="mt-2 cursor-pointer rounded-xl bg-black/30 p-3 text-center hover:bg-white/10 "
            onClick={() => {
              // copy to clipboard
              navigator.clipboard.writeText(
                "0x50g9fi5wf0if43jjopdk0f50g9uq09fj0f9jg0uw049f2jose",
              );
              // display popup
              alert("Copied to clipboard!");
            }}
          >
            <Text className="flex  items-center justify-center text-sm">
              {"0x50g9fi5wf0if43jjopdk0f50g9uq09fj0f9jg0uw049f2jose"}
            </Text>
            <div
              className="
            mt-2 text-xs font-medium uppercase text-blue-600
            "
            >
              Click to copy
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <Button className="block w-44" variant="outline" onClick={onDismiss}>
            Cancel
          </Button>
          {/* <Button className="block w-44">Execute</Button> */}
        </div>
      </Box>
    </div>
  );
}

const ToleranceSetting = () => {
  const [toleranceNumber, setToleranceNumber] = useState<number>(1);
  const tolerances = [1, 2];
  const inputRef = useRef<HTMLInputElement>(null);
  const handleInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    //we need to make sure we don't lose the cursor
    //so we save the cursor position
    const cursorPosition = e.target.selectionStart;
    // set the value
    setToleranceNumber(parseFloat(e.target.value));
    // set the cursor position back
    inputRef.current?.setSelectionRange(cursorPosition, cursorPosition);
  };
  return (
    <>
      {tolerances.map((tolerance) => (
        <Box
          key={`asset-${tolerance}%`}
          className={cn(
            "w-17 flex h-9 flex-row items-center space-x-3 text-center",
            "cursor-pointer",
            toleranceNumber === tolerance ? "bg-blue-800" : "bg-gray-700",
          )}
          onClick={() => setToleranceNumber(tolerance)}
        >
          <Text>{tolerance}%</Text>
        </Box>
      ))}
      <Box
        key={`asset-custom%`}
        className={cn(
          "flex h-9 w-20 flex-row items-center space-x-3 text-center",
          "cursor-pointer",
          "bg-black/30",
          // border styles on focus (its an input container)
          " focus-within:ring-1 focus-within:ring-blue-800 ",
          // if toleranceNumber is not 1 or 2 then we are in custom mode and we need to show the border
          !tolerances.includes(toleranceNumber) && "ring-2 ring-blue-800 ",
        )}
      >
        <input
          type="number"
          min={0}
          value={
            inputRef.current !== document.activeElement
              ? toleranceNumber
              : undefined
          }
          className={cn(
            "w-10 bg-transparent text-center",
            // avoid showing the up and down arrows
            "[-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none",
            // get rid of custom styles on focus
            "focus:outline-none",
          )}
          onChange={handleInputChanged}
        />
        %
      </Box>
    </>
  );
};
