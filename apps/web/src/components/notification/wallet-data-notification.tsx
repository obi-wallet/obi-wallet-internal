"use client";

import { Notification } from "@/components";
import {
  useWalletDataStateQuery,
  WalletDataStateType,
} from "@/wallet-data-backup/sync-wallet-data";
import { useWalletBackupMutation } from "@/wallet-health/checks";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";

export const WalletDataNotification = observer(
  function WalletDataNotification() {
    const walletDataState = useWalletDataStateQuery();
    const backupWallet = useWalletBackupMutation();
    const router = useRouter();

    switch (walletDataState.data?.type) {
      case WalletDataStateType.NotAvailable:
        return (
          <Notification
            description="Caution: Your wallet has not been backed up yet. Please back up your wallet to enable recovery by clicking this banner."
            type="warning"
            onClick={() => {
              backupWallet.mutate();
            }}
          />
        );
      case WalletDataStateType.Outdated:
        return (
          <Notification
            description="Caution: Your local wallet data is out of sync. Resync your data by clicking this banner."
            type="warning"
            onClick={() => {
              router.push("/dashboard/sync-wallet-data");
            }}
          />
        );
      default:
        return null;
    }
  },
);
