"use client";
import { cn } from "@/lib/utils";
import { FaSketch } from "react-icons/fa6";

import {
  BalanceInput,
  Box,
  Button,
  IBalanceOption,
  Input,
  Modal,
  Text,
} from "..";

export function TravelModal({ balances }: { balances: IBalanceOption[] }) {
  const tolerances = [
    { label: "1%", selected: false },
    { label: "2%", selected: false },
    { label: "5%", selected: true },
  ];

  return (
    <Modal title="Obi Fast Travel">
      <BalanceInput
        showMaxButton={false}
        balances={balances}
        placeholder="Deposit"
      />
      <Input placeholder="Receive (Estimated)" endIcon={FaSketch} />

      <div className="space-y-2">
        <Text color="zinc" size="xs">
          Slippage Tolerance
        </Text>

        <div className="flex flex-row space-x-3">
          {tolerances.map((tolerance) => (
            <Box
              key={`asset-${tolerance.label}`}
              className={cn(
                "flex flex-row space-x-3 ",
                tolerance.selected ? "bg-slate-950" : "bg-gray-700",
              )}
            >
              <Text>{tolerance.label}</Text>
            </Box>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button className="block w-44">Execute</Button>
      </div>
    </Modal>
  );
}
