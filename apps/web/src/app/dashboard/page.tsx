"use client";

import { Box } from "@/components";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { observer } from "mobx-react-lite";

export default observer(function Dashboard() {
  useCurrentWallet({ redirectTo: "/" });

  return (
    <div className="grid h-full w-full grid-rows-3 gap-4 px-7 py-5 text-white">
      <Box title="Applications" />
      <Box title="Chart" />
      <Box title="Top Positions" />
    </div>
  );
});
