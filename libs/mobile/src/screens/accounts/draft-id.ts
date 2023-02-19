import { Wallet } from "@obi-wallet/common";

export function getGatekeeperConfigDraftId(wallet: Wallet): string {
  return `gatekeeper-config/${wallet.id}`;
}
