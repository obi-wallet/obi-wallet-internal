"use client";
import {
  BalanceInput,
  Box,
  Button,
  IBalanceOption,
  Input,
  TabUi,
} from "@/components";

import { toAssets } from "../../fast-travel/assets";

export default function Send() {
  const balances: IBalanceOption[] = [
    {
      network: "Neutron",
      assetUnit: "NTRN",
      balance: 140.44,
      image: toAssets["neutron"]?.image,
    },
    {
      network: "Osmosis",
      assetUnit: "osmo",
      balance: 120.55,
      image: toAssets["osmosis"]?.image,
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
            <BalanceInput label="Amount" balances={balances} />
            <Input labelText="Recipient Address" />
            <div className="flex justify-end">
              <Button className="block w-44">Next</Button>
            </div>
          </div>
        </TabUi.Main>
      </Box>
    </div>
  );
}
