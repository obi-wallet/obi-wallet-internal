import { PrettyCaip19Asset } from "@/hooks/balances";
import { AbstractKVStore } from "@obi-wallet/headless-ui-store";
import { MpcWallets } from "@obi-wallet/sdk";
import {
  Caip19AssetId,
  Caip2ChainId,
  Caip2ChainIdSchema,
} from "@obi-wallet/sdk-caip";
import { serialize } from "@obi-wallet/sdk-json";
import { Session } from "@obi-wallet/wallet-connect";
import { DateTime } from "luxon";
import { autorun, observable, runInAction, toJS, when } from "mobx";
import { z } from "zod";

const lastBalancesTrackSchema = z.object({
  balances: z.array(
    z.object({
      assetId: z.custom<Caip19AssetId>(),
      rawAmount: z.string(),
      usdBalance: z.string(),
    }),
  ),
  timestamp: z.string(),
});

const lastBalancesTrackPerChainSchema = z.record(
  Caip2ChainIdSchema,
  lastBalancesTrackSchema,
);

const lastBalancesTracksPerWalletSchema = z.record(
  lastBalancesTrackPerChainSchema,
);

export type LastBalancesTracksPerWallet = z.infer<
  typeof lastBalancesTracksPerWalletSchema
>;

export class AnalyticsStore {
  @observable
  protected accessor lastBalanceTracks: LastBalancesTracksPerWallet = {};
  @observable protected accessor pairingTopicToSession: Record<
    string,
    Session
  > = {};

  protected readonly kvStore: AbstractKVStore;
  protected readonly walletsStore: MpcWallets;

  public constructor({
    kvStore,
    walletsStore,
  }: {
    kvStore: AbstractKVStore;
    walletsStore: MpcWallets;
  }) {
    this.kvStore = kvStore;
    this.walletsStore = walletsStore;
    void this.init();
  }

  protected async init() {
    const lastBalanceTracks = await this.getFromKVStore();

    runInAction(() => {
      this.lastBalanceTracks = lastBalanceTracks;
    });

    autorun(async () => {
      const data = lastBalancesTracksPerWalletSchema.parse(
        toJS(this.lastBalanceTracks),
      );
      await this.kvStore.set("last-balances-tracks", data);
    });
  }

  protected async getFromKVStore(): Promise<LastBalancesTracksPerWallet> {
    const data = await this.kvStore.get("last-balances-tracks");
    const result = lastBalancesTracksPerWalletSchema.safeParse(data);
    if (!result.success) return {};
    return result.data;
  }

  public async trackSessionApproval(session: Session) {
    // Persist the session so that we access peer metadata in `trackOnboardingViaPairingUri`
    runInAction(() => {
      this.pairingTopicToSession[session.pairingTopic] = session;
    });
    await fetch("/api/analytics/app-connect", {
      method: "POST",
      body: serialize({
        userEntryAddress: this.walletsStore.currentWallet?.userEntryAddress,
        dAppUrl: session?.peer.metadata.url,
      }),
    });
  }

  public async trackOnboarding() {
    await fetch("/api/analytics/onboarding", {
      method: "POST",
      body: serialize({
        userEntryAddress: this.walletsStore.currentWallet?.userEntryAddress,
      }),
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

      await fetch("/api/analytics/onboarding", {
        method: "POST",
        body: serialize({
          userEntryAddress: this.walletsStore.currentWallet?.userEntryAddress,
          dAppUrl: session?.peer.metadata.url,
        }),
      });
    } catch (error) {
      console.log(error);
      await fetch("/api/analytics/onboarding", {
        method: "POST",
        body: serialize({
          userEntryAddress: this.walletsStore.currentWallet?.userEntryAddress,
          dAppUrl: "UNKNOWN",
        }),
      });
    }
  }

  public async trackBalancesPerChain({
    userEntryAddress,
    chainId,
    balances,
  }: {
    userEntryAddress: string;
    chainId: Caip2ChainId;
    balances: PrettyCaip19Asset[];
  }) {
    const relevantBalances = balances
      .filter((balance) => {
        return balance.rawAmount !== "0";
      })
      .map((balance) => {
        return {
          assetId: balance.assetId,
          rawAmount: balance.rawAmount,
          usdBalance: balance.usdBalance,
        };
      });

    const lastTrack = this.lastBalanceTracks[userEntryAddress]?.[chainId];
    const now = DateTime.now();

    if (lastTrack) {
      const lastTrackTimestamp = DateTime.fromISO(lastTrack.timestamp);
      const age = now.diff(lastTrackTimestamp, "days");

      const lastTrackAssetIds = new Set(
        lastTrack.balances.map((balance) => {
          return balance.assetId;
        }),
      );
      const currentTrackAssetIds = new Set(
        relevantBalances.map((balance) => {
          return balance.assetId;
        }),
      );
      const areSetsEqual = <T>(a: Set<T>, b: Set<T>) => {
        return (
          a.size === b.size &&
          [...a].every((value) => {
            return b.has(value);
          })
        );
      };
      const relevantChange = !areSetsEqual(
        lastTrackAssetIds,
        currentTrackAssetIds,
      );

      if (!relevantChange && age.days < 1) {
        return;
      }
    }

    await this.trackBalances({ userEntryAddress, balances: relevantBalances });
    runInAction(() => {
      this.lastBalanceTracks[userEntryAddress] = {
        ...this.lastBalanceTracks[userEntryAddress],
        [chainId]: {
          balances: relevantBalances,
          timestamp: now.toISO(),
        },
      };
    });
  }

  protected async trackBalances({
    userEntryAddress,
    balances,
  }: {
    userEntryAddress: string;
    balances: {
      assetId: Caip19AssetId;
      rawAmount: string;
      usdBalance: string;
    }[];
  }) {
    await fetch("/api/analytics/balances", {
      method: "POST",
      body: serialize({
        userEntryAddress,
        balances,
      }),
    });
  }
}
