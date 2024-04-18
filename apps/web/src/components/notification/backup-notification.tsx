"use client";

import { Notification } from "@/components";
import {
  useWalletBackupCheck,
  useWalletBackupMutation,
} from "@/wallet-health/checks";
import { observer } from "mobx-react-lite";

export const BackupNotification = observer(function BackupNotification() {
  const check = useWalletBackupCheck();
  const backupWallet = useWalletBackupMutation();

  const failure =
    (check.query.isSuccess && !check.query.data) || check.query.isError;

  if (failure) {
    return (
      <Notification
        description="Caution: Your wallet has not been backed up yet. Please back up your wallet to enable recovery by clicking this banner."
        type="warning"
        onClick={() => {
          backupWallet.mutate();
        }}
      />
    );
  }
});
