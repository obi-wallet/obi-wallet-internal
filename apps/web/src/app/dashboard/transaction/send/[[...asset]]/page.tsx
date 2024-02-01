"use client";
import {
  BalanceInput,
  Button,
  IBalanceOption,
  Input,
  TabUi,
} from "@/components";

// import { toAssets } from "../../../fast-travel/assets";
import { usePathname } from "next/navigation";

export default function Send({
  params,
}: {
  params: { asset: string | undefined };
}) {
  const asset = params.asset;

  return (
    <TabUi.Main>
      <div className="space-y-7 py-4">
        {/* <BalanceInput label="Amount" balances={} /> */}
        <Input labelText="Recipient Address" />
        <div className="flex justify-end">
          <Button className="block w-44">Next</Button>
        </div>
      </div>
    </TabUi.Main>
  );
}
