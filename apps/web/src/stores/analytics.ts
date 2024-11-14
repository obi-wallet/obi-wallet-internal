import { MpcWallets } from "@obi-wallet/sdk";
import { Session } from "@obi-wallet/wallet-connect";

export class AnalyticsStore {
  public readonly walletsStore: MpcWallets;

  public constructor({ walletsStore }: { walletsStore: MpcWallets }) {
    this.walletsStore = walletsStore;
  }

  public async trackSessionApproval(session: Session) {
    // TODO: mocked for now
    console.log("ANALYTICS: session_approval", {
      userEntryAddress: this.walletsStore.currentWallet?.userEntryAddress,
      dAppUrl: session.peer.metadata.url,
    });
  }
}
