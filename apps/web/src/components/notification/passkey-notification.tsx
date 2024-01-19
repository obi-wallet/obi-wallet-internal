"use client";

import { Notification } from "@/components";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { observer } from "mobx-react-lite";

export const PasskeyNotification = observer(function PasskeyNotification() {
  const currentWallet = useCurrentWallet({});
  const isOnlyPassKey = currentWallet && currentWallet.owner.keys.length === 1;

  if (!isOnlyPassKey) return null;

  return (
    <Notification
      description="CAUTION: Your account is currently only secured by your device passkey. Please add a <b>mobile key</b> to enable recovery on other devices."
      type="warning"
    />
  );
});
