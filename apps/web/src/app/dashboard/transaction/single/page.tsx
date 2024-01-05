"use client";

import { Button, Text, Transaction } from "@/components";
import { useState } from "react";

export default function SingleKeyTransaction() {
  const threshold = 1;
  const [confirmedKeyCount, setConfirmedKeyCount] = useState(0);
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
        <Button
          className="mt-4"
          block
          onClick={() => setConfirmedKeyCount(1)}
          variant={threshold > confirmedKeyCount ? "primary" : "confirmed"}
          disabled={threshold === confirmedKeyCount}
        >
          Passkey
        </Button>

        <div className="mt-6 flex w-full flex-row space-x-6 ">
          <Button block variant="outline">
            Reject
          </Button>
          <Button block disabled={confirmedKeyCount < threshold}>
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
}
