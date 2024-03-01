"use client";

import { useBackupWalletAutomatically } from "@/wallet-health/checks";
import { observer } from "mobx-react-lite";

export const WalletBackupFixer = observer(function WalletBackupFixer() {
  useBackupWalletAutomatically();
  return null;
});
