import { MultisigWallet } from "@obi-wallet/sdk";

export function getGatekeeperConfigDraftId(wallet: MultisigWallet): string {
  return `gatekeeper-config/${wallet.id}`;
}
