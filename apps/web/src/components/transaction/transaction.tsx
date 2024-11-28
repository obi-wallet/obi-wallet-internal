"use client";

import { Text, Box, Button } from "@/components";
import { cn } from "@/lib/utils";
import { TargetChain, TargetChainId } from "@/target-chain";
import { serialize } from "@obi-wallet/sdk-json";
import Image from "next/image";
import { ComponentPropsWithoutRef, useState } from "react";

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
  addresses?: string[];
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
  addresses = [],
  ...rest
}: TransactionProps) {
  const [showData, setShowData] = useState(false);
  const targetChainLabel = targetChainId
    ? TargetChain.chainId(targetChainId).label
    : "";
  const image = targetChainId
    ? TargetChain.chainId(targetChainId).image
    : "/assets/icons/transaction-lock.svg";

  return (
    <Box
      className={cn(
        "relative flex w-96 flex-col items-center justify-center px-8",
        { "py-12": !!image },
        className,
      )}
      {...rest}
    >
      {image ? (
        <div className="bg-background absolute -top-8 h-[70px] w-[70px] rounded-full p-4">
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
          <Text className="mt-4" size="sm" color="zinc">
            Amount
          </Text>
          <Text size="2xl" className="mt-1">
            {amountInfo
              .map((info) => {
                return `${info.amount} ${info.denom}`;
              })
              .join("\n")}
          </Text>
        </>
      ) : null}
      {addresses.length > 0 ? (
        <div
          className={cn(
            { "mt-4": amountInfo.length > 0 },
            "flex flex-col items-center justify-center gap-1",
          )}
        >
          <Text color="zinc" className="text-sm">
            {`Send ${amountInfo
              .map((info) => {
                return `${info.amount} ${info.denom}`;
              })
              .join(",")} to`}
          </Text>
          <Text
            color="blue"
            className="break-all text-center text-xs leading-normal"
          >
            {addresses.join("\n")}
          </Text>
        </div>
      ) : (
        <Text
          className={cn(
            { "mt-4": amountInfo.length > 0 },
            "break-all text-center leading-normal",
          )}
          color="zinc"
        >
          {descriptions.join("\n")}
        </Text>
      )}

      {targetChainLabel || feeInfo.length > 0 || memo ? (
        <div className="mt-5 w-full space-y-3">
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
                  .map((info) => {
                    return `${info.amount} ${info.denom}`;
                  })
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
        {rawData ? (
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
        ) : null}
        {showData ? (
          <div
            className={cn(
              "max-md:max-h-[80px]",
              "max-h-[200px] w-full space-y-3 overflow-auto pr-1",
              "scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300 scrollbar-track-rounded-full scrollbar-thumb-rounded-full scrollbar-corner-rounded-full",
            )}
          >
            <pre className="text-gray-400">
              {typeof rawData === "string"
                ? rawData
                : serialize(rawData, null, 2)}
            </pre>
          </div>
        ) : null}
      </div>
    </Box>
  );
}
