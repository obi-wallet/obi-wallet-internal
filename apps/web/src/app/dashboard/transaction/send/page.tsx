"use client";
import {
  BalanceInput,
  Box,
  Button,
  IBalanceOption,
  Input,
  TabUi,
} from "@/components";
import { FaSketch } from "react-icons/fa6";

export default function Send() {
  const balances: IBalanceOption[] = [
    {
      network: "Neutron",
      assetUnit: "NTRN",
      balance: 140.44,
      icon: FaSketch,
    },
    {
      network: "Neutron1",
      assetUnit: "NTRN1",
      balance: 120.55,
      icon: FaSketch,
    },
  ];

  return (
    <div className="h-full w-full p-6">
      <Box className="w-2/3">
        <TabUi.Links>
          <TabUi.Link href="/dashboard/transaction/send" active>
            Send Tokens
          </TabUi.Link>
          <TabUi.Link href="/dashboard/transaction/receive">
            Receive Tokens
          </TabUi.Link>
        </TabUi.Links>

        <TabUi.Main>
          <div className="space-y-7 py-4">
            <BalanceInput placeholder="Amount" balances={balances} />
            <Input placeholder="Recipient Address" />
            <div className="flex justify-end">
              <Button className="block w-44">Next</Button>
            </div>
          </div>
        </TabUi.Main>
      </Box>
    </div>
  );
}
