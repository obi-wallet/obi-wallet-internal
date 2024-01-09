import { Text } from "@/components";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ComponentPropsWithoutRef } from "react";

import { Box, Button } from "..";

type TransactionProps = {
  amountInfo: {
    amount: number;
    unit: string;
  };
  description: string;
  network: string;
  feeInfo: {
    amount: number;
    unit: string;
  };
} & ComponentPropsWithoutRef<"div">;

export function Transaction({
  amountInfo,
  description,
  network,
  feeInfo,
  className,
  ...rest
}: TransactionProps) {
  return (
    <Box
      className={cn(
        "relative flex flex-col items-center justify-center px-8 py-7",
        className,
      )}
      {...rest}
    >
      <Image
        width="70"
        height="70"
        src="/assets/images/ntrn-logo.png"
        alt="NTRN Logo"
        className="absolute -top-8"
      />
      <Text className="mt-10" size="sm" color="zinc">
        Amount
      </Text>
      <Text size="2xl" className="mt-1">{`${amountInfo.amount.toFixed(2)} ${
        amountInfo.unit
      }`}</Text>
      <Text className="mt-12" color="zinc">
        {description}
      </Text>

      <div className="mt-9 w-full space-y-3">
        <div className="flex flex-row justify-between">
          <Text color="gray">Network</Text>
          <Text color="gray">{network}</Text>
        </div>
        <div className="flex flex-row justify-between">
          <Text color="gray">Fee</Text>
          <Text color="gray">{`${feeInfo.amount} ${feeInfo.unit}`}</Text>
        </div>
      </div>
      <Button disabled className="mt-6 h-8 w-full justify-center ">
        See Data
      </Button>
    </Box>
  );
}
