"use client";

import { Notification } from "@/components";
import { useStore } from "@/contexts";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import {
  useWalletDataStateQuery,
  WalletDataStateType,
} from "@/wallet-data-backup/sync-wallet-data";
import { useWalletBackupMutation } from "@/wallet-health/checks";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";

export const WalletDataNotification = observer(
  function WalletDataNotification() {
    const wallet = useCurrentWallet();
    const walletDataState = useWalletDataStateQuery();
    const backupWallet = useWalletBackupMutation();
    const { homeAccountSetupStore } = useStore();
    const router = useRouter();

    switch (walletDataState.data?.type) {
      case WalletDataStateType.HomeAccountNotAvailable:
        if (wallet && homeAccountSetupStore.isSetupPending(wallet.id)) {
          return null;
        }

        return (
          <Notification
            description="Caution: Your account has not been persisted on chain yet. Please finish setting up your account by clicking this banner."
            type="warning"
            onClick={() => {
              router.push("/dashboard/settings/security");
            }}
          />
        );
      case WalletDataStateType.BackupNotAvailable:
        return (
          <Notification
            description="Caution: Your account has not been backed up yet. Please back up your account to enable recovery by clicking this banner."
            type="warning"
            onClick={() => {
              backupWallet.mutate();
            }}
          />
        );
      case WalletDataStateType.Outdated:
        return (
          <Notification
            description="Caution: Your local account data is out of sync. Resync your data by clicking this banner."
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
