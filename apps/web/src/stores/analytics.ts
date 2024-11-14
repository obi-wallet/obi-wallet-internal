import { MpcWallets } from "@obi-wallet/sdk";
import { Session } from "@obi-wallet/wallet-connect";
import { observable, runInAction, when } from "mobx";

export class AnalyticsStore {
  @observable protected accessor pairingTopicToSession: Record<
    string,
    Session
  > = {};

  public readonly walletsStore: MpcWallets;

  public constructor({ walletsStore }: { walletsStore: MpcWallets }) {
    this.walletsStore = walletsStore;
  }

  public async trackSessionApproval(session: Session) {
    // Persist the session so that we access peer metadata in `trackOnboardingViaPairingUri`
    runInAction(() => {
      this.pairingTopicToSession[session.pairingTopic] = session;
    });
    // TODO: mocked for now
    console.log("ANALYTICS: session_approval", {
      userEntryAddress: this.walletsStore.currentWallet?.userEntryAddress,
      dAppUrl: session.peer.metadata.url,
    });
  }

  public async trackOnboarding() {
    console.log("ANALYTICS: finished onboarding", {
      userEntryAddress: this.walletsStore.currentWallet?.userEntryAddress,
    });
  }

  public async trackOnboardingViaPairingUri(pairingUri: string) {
    try {
      const withoutPrefix = pairingUri.slice("wc:".length);
      const [pairingTopic, _rest] = withoutPrefix.split("@");

      if (!pairingTopic) return;

      // Wait for `trackSessionApproval` to persist the session
      await when(
        () => {
          return !!this.pairingTopicToSession[pairingTopic];
        },
        {
          timeout: 10_000,
        },
      );

      const session = this.pairingTopicToSession[pairingTopic];

      // TODO: mocked for now
      console.log("ANALYTICS: onboarding via dApp", {
        userEntryAddress: this.walletsStore.currentWallet?.userEntryAddress,
        dAppUrl: session?.peer.metadata.url,
      });
    } catch (error) {
      console.log(error);
      // TODO: mocked for now
      console.log(
        "ANALYTICS: onboarding via dApp but connection failed/timed out",
        {
          userEntryAddress: this.walletsStore.currentWallet?.userEntryAddress,
        },
      );
    }
  }
}
