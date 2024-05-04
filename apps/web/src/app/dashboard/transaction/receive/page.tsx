"use client";

import { DropDown, TabUi } from "@/components";
import { usePublicKey } from "@/hooks/use-public-key";
import { cn } from "@/lib/utils";
import { TargetChain, TargetChainId } from "@/target-chain";
import {
  CosmosSdkChainId,
  CosmosSdkChains,
} from "@/target-chain/cosmos-sdk/chains";
import { InputContainer } from "@/ui/container";
import copy from "copy-to-clipboard";
import { observer } from "mobx-react-lite";
import { useQRCode } from "next-qrcode";
import { useState } from "react";
import { FaCheck } from "react-icons/fa6";

export default observer(function Receive() {
  const { Canvas } = useQRCode();
  const [chainId, setChainId] = useState<TargetChainId>(CosmosSdkChainId.Sei);
  const [isCopied, setIsCopied] = useState(false);
  const publicKey = usePublicKey();

  if (publicKey === undefined) return null;
  const address = TargetChain.chainId(chainId).computeAddress(publicKey);

  const handleClickQRCode = () => {
    if (!address) return;

    copy(address);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <TabUi.Main>
      <div className="flex w-full flex-col items-center justify-center space-y-7  py-4">
        <InputContainer
          className="relative z-10  w-80"
          label="Chain"
          labelClassname="bg-background-secondary"
        >
          <ChainDropdown onChange={setChainId} chainId={chainId} />
        </InputContainer>
        {address ? (
          <InputContainer
            label="Address"
            labelClassname="bg-background-secondary"
            onClick={handleClickQRCode}
            className="relative z-0  flex w-80 flex-col"
          >
            <div className="flex flex-1 items-center justify-center transition duration-300  group-hover:scale-105 group-active:scale-100">
              <Canvas
                text={address}
                options={{
                  errorCorrectionLevel: "M",
                  margin: 3,
                  scale: 4,
                  width: 200,
                }}
              />
            </div>

            <div
              className={`absolute  bottom-0 left-1/2   flex -translate-x-1/2 -translate-y-1/2 gap-4 rounded-md bg-gray-500 px-4 py-2 text-center text-white transition duration-200 ease-in-out ${
                isCopied
                  ? "visible bottom-1/2  opacity-100"
                  : "invisible bottom-0 opacity-0"
              } transition-visibility  `}
            >
              <span className=" text-green-500">
                <FaCheck />
              </span>
              <p>Copied</p>
            </div>

            <div className="flex flex-col items-center">
              <span className="mt-5 text-center text-xs text-white">
                {address}
              </span>
              <span className="mt-1  text-center text-sm font-bold  uppercase text-blue-600 transition duration-300  group-hover:scale-105 group-active:scale-100">
                Click to Copy
              </span>
            </div>
          </InputContainer>
        ) : null}
      </div>
    </TabUi.Main>
  );
});

const ChainDropdown = observer(function ChainDropdown({
  onChange,
  chainId,
}: {
  chainId: TargetChainId;
  onChange: (chainId: TargetChainId) => void;
}) {
  const chainOptions = Object.values(CosmosSdkChains).map(
    ({ name, id, image, disabled }) => {
      return {
        label: name,
        value: id,
        image,
        disabled,
      };
    },
  );
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
