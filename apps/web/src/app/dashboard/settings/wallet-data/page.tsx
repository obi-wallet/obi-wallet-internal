"use client";

import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { observer } from "mobx-react-lite";
import { notFound } from "next/navigation";

export default observer(function WalletData() {
  const wallet = useCurrentWallet({});

  if (process.env.NEXT_PUBLIC_ENV !== "development") return notFound();

  return (
    <pre className="text-white">
      {JSON.stringify(wallet?.toJSON(), null, 2)}
    </pre>
  );
});
