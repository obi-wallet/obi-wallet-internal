"use client";

import { Button, Text, Transaction } from "@/components";
import { useState } from "react";

type KeyType = {
  type: string;
  label: string;
  confirmed: boolean;
};

export default function MultiKeyTransaction() {
  const [signKeys, setSignKeys] = useState<KeyType[]>([
    { type: "email", label: "Key 1", confirmed: false },
    { type: "cloud", label: "Key 2", confirmed: false },
    { type: "telegram", label: "Key 3", confirmed: false },
  ]);
  const threshold = 2;

  const handleConfirmKey = (keyType: string) => {
    setSignKeys((prevKeys) => {
      const keys = [...prevKeys];
      const confirmKey = prevKeys.findIndex((key) => key.type === keyType);

      const key = keys[confirmKey];
      if (key) {
        key.confirmed = true;
        return keys;
      }
      return prevKeys;
    });
  };

  const approvedThresholdKeys =
    signKeys.filter((key) => key.confirmed).length >= threshold;

  const displayKeys = approvedThresholdKeys
    ? signKeys.filter((key) => key.confirmed)
    : signKeys;

  return (
    <div className="flex justify-center">
      <div className="flex w-fit flex-col items-center">
        <Text
          leading="loose"
          size="3xl"
          fontWeight="bold"
          className="mb-8 mt-4"
        >
          Complete Transaction
        </Text>

        <Transaction
          amountInfo={{ amount: 1250, unit: "NTRN" }}
          description="Stake 1,250.00 NTRN to xyz validator"
          network="Neutron"
          feeInfo={{ amount: 0.03021, unit: "NTRN" }}
        />

        <Text className="mt-4">{`${threshold} Key${
          threshold > 1 ? "s" : ""
        } Required`}</Text>

        <div className="flex w-full flex-col space-y-3">
          {displayKeys.map((key) => (
            <Button
              key={`transaction-approve-key-${key.type}`}
              className="mt-4"
              block
              onClick={() => handleConfirmKey(key.type)}
              variant={key.confirmed ? "confirmed" : "primary"}
            >
              {key.label}
            </Button>
          ))}
        </div>

        <div className="mt-6 flex w-full flex-row space-x-6 ">
          <Button block variant="outline">
            Reject
          </Button>
          <Button block disabled={!approvedThresholdKeys}>
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
}
