"use client";

import { Notification } from "@/components";
import { useLocalDataIsUpToDateCheck } from "@/wallet-health/checks";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";

export const OutdatedNotification = observer(function OutdatedNotification() {
  const check = useLocalDataIsUpToDateCheck();
  const router = useRouter();

  const failure =
    (check.query.isSuccess && !check.query.data) || check.query.isError;

  if (failure) {
    return (
      <Notification
        description="Caution: Your local wallet data is out of sync. Resync your data by clicking this banner."
        type="warning"
        onClick={() => {
          router.push("/dashboard/sync-wallet-data");
        }}
      />
    );
  }
});
