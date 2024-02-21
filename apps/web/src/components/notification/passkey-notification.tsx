"use client";

import { Notification } from "@/components";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { observer } from "mobx-react-lite";
import { usePathname } from "next/navigation";

export const PasskeyNotification = observer(function PasskeyNotification() {
  const currentWallet = useCurrentWallet({});
  const isOnlyPassKey = currentWallet && currentWallet.owner.keys.length === 1;
  const pathName = usePathname();
  const isDashboard = pathName.includes("/dashboard");

  if (!isOnlyPassKey || !isDashboard) return null;

  return (
    <Notification
      description="Caution: Your account is currently only secured by your passkey. Please add one or more <b>recovery keys</b>."
      type="warning"
    />
  );
});
