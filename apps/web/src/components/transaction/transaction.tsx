"use client";

import { Text } from "@/components";
import { cn } from "@/lib/utils";
import { TargetChain, TargetChainId } from "@/target-chain";
import { CosmosSdkChains } from "@/target-chain/cosmos-sdk/chains";
import Image from "next/image";
import { ComponentPropsWithoutRef, useState } from "react";

import { Box, Button } from "..";

type TransactionProps = {
  amountInfo: {
    amount: string;
    denom: string;
  }[];
  feeInfo: readonly {
    amount: string;
    denom: string;
  }[];
  descriptions: string[];
  memo: string;
  targetChainId?: TargetChainId;
  rawData: unknown;
} & ComponentPropsWithoutRef<"div">;

export function Transaction({
  amountInfo,
  descriptions,
  feeInfo,
  className,
  targetChainId,
  rawData,
  memo,
  ...rest
}: TransactionProps) {
  const [showData, setShowData] = useState(false);
  const targetChainLabel = targetChainId
    ? TargetChain.chainId(targetChainId).label
    : "";
  const image = targetChainId
    ? CosmosSdkChains[targetChainId].image
    : "/assets/icons/transaction-lock.svg";

  console.log({
    amountInfo,
    descriptions,
    feeInfo,
    className,
    targetChainId,
    rawData,
    memo,
    ...rest,
  });

  return (
    <Box
      className={cn(
        "relative flex w-80 flex-col items-center justify-center px-8",
        { "py-12": !!image },
        className,
      )}
      {...rest}
    >
      {image ? (
        <div className="absolute -top-8 h-[70px] w-[70px] rounded-full bg-black p-4">
          <Image
            width="70"
            height="70"
            src={image}
            alt={`${targetChainLabel} logo`}
          />
        </div>
      ) : null}
      {amountInfo.length > 0 ? (
        <>
          <Text className="mt-10" size="sm" color="zinc">
            Amount
          </Text>
          <Text size="2xl" className="mt-1">
            {amountInfo
              .map((info) => `${info.amount} ${info.denom}`)
              .join("\n")}
          </Text>
        </>
      ) : null}
      <Text
        className={cn(
          { "mt-12": amountInfo.length > 0 },
          "text-center leading-normal",
        )}
        color="zinc"
      >
        {descriptions.join("\n")}
      </Text>

      {targetChainLabel || feeInfo.length > 0 || memo ? (
        <div className="mt-9 w-full space-y-3">
          {targetChainLabel ? (
            <div className="flex flex-row justify-between">
              <Text color="gray">Network</Text>
              <Text color="gray">{targetChainLabel}</Text>
            </div>
          ) : null}
          {feeInfo.length > 0 ? (
            <div className="flex flex-row justify-between">
              <Text color="gray">Fee</Text>
              <Text color="gray">
                {feeInfo
                  .map((info) => `${info.amount} ${info.denom}`)
                  .join("\n")}
              </Text>
            </div>
          ) : null}
          {memo.length ? (
            <div className="flex flex-row justify-between">
              <Text color="gray">Memo</Text>
              <Text color="gray">{memo}</Text>
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="mt-6 flex w-full flex-col bg-indigo-950">
        <Button
          className="w-full justify-center"
          size="sm"
          onClick={() => {
            setShowData(!showData);
          }}
          variant="detail"
        >
          See Data
        </Button>
        {showData ? (
          <div className="scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300 scrollbar-track-rounded-full scrollbar-thumb-rounded-full scrollbar-corner-rounded-full mt-6 max-h-[360px] w-full space-y-3 overflow-auto pr-1">
            <pre className="text-gray-400">
              {typeof rawData === "string"
                ? rawData
                : JSON.stringify(rawData, null, 2)}
            </pre>
          </div>
        ) : null}
      </div>
    </Box>
  );
}
