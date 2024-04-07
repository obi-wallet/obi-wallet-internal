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
  ...rest
}: TransactionProps) {
  const [showData, setShowData] = useState(false);
  const targetChainLabel = targetChainId
    ? TargetChain.chainId(targetChainId).label
    : "";
  const image = targetChainId ? CosmosSdkChains[targetChainId].image : null;

  return (
    <Box
      className={cn(
        "relative flex flex-col items-center justify-center px-8",
        { "py-7": !!image },
        className,
      )}
      {...rest}
    >
      {image ? (
        <Image
          width="70"
          height="70"
          src={image}
          alt={`${targetChainLabel} logo`}
          className="absolute -top-8"
        />
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
      <Text className={cn({ "mt-12": amountInfo.length > 0 })} color="zinc">
        {descriptions.join("\n")}
      </Text>

      {targetChainLabel || feeInfo.length > 0 ? (
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
        </div>
      ) : null}
      <Button
        className="mt-6 h-8 w-full justify-center"
        onClick={() => {
          setShowData(!showData);
        }}
      >
        See Data
      </Button>
      {showData ? (
        <div className="mt-6 w-full space-y-3">
          <Text color="gray">Raw Data</Text>
          <pre className="text-gray-400">
            {typeof rawData === "string"
              ? rawData
              : JSON.stringify(rawData, null, 2)}
          </pre>
        </div>
      ) : null}
    </Box>
  );
}
