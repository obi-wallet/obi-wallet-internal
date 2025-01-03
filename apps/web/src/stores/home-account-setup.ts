import { HomeChain } from "@/home-chain";
import { AbstractKVStore } from "@obi-wallet/headless-ui-store";
import {
  HomeChainId,
  LocalMpcWalletSchema,
  MpcWallet,
  MpcWallets,
  MultisigKey,
  SecretJsHomeChainId,
  UserEntryAddress,
} from "@obi-wallet/sdk";
import { serialize } from "@obi-wallet/sdk-json";
import { Effect, Schedule } from "effect";
import { z } from "zod";

import { KeyMetaData, KeyMetaDataStore } from "./key-meta-data";
import { DistributeSharesResponse } from "./mpc";
import { TargetChainsStore } from "./target-chains";
import { UserDataStore } from "./user-data";
import { ViewingKeysStore } from "./viewing-keys";

const UnclaimedHomeAccount = z.object({
  homeAccountAddress: UserEntryAddress,
  ownerAddress: z.string(),
  ownerIndex: z.number(),
});

type UnclaimedHomeAccount = z.TypeOf<typeof UnclaimedHomeAccount>;

const unclaimedHomeAccountKvStoreEntry = "home-account";

export class HomeAccountSetupStore {
  protected readonly walletsStore: MpcWallets;
  protected readonly keyMetaDataStore: KeyMetaDataStore;
  protected readonly targetChainsStore: TargetChainsStore;
  protected readonly userDataStore: UserDataStore;
  protected readonly viewingKeysStore: ViewingKeysStore;
  protected readonly kvStore: AbstractKVStore;
  protected _homeAccountPromise: Promise<UnclaimedHomeAccount> | undefined;
  protected _setupPromises = new Map<string, Promise<void>>();

  constructor({
    walletsStore,
    keyMetaDataStore,
    targetChainsStore,
    userDataStore,
    viewingKeysStore,
    kvStore,
  }: {
    walletsStore: MpcWallets;
    keyMetaDataStore: KeyMetaDataStore;
    targetChainsStore: TargetChainsStore;
    userDataStore: UserDataStore;
    viewingKeysStore: ViewingKeysStore;
    kvStore: AbstractKVStore;
  }) {
    this.walletsStore = walletsStore;
    this.keyMetaDataStore = keyMetaDataStore;
    this.targetChainsStore = targetChainsStore;
    this.userDataStore = userDataStore;
    this.viewingKeysStore = viewingKeysStore;
    this.kvStore = kvStore;
  }

  public async setupHomeAccount({
    wallet,
    shares,
  }: {
    wallet: MpcWallet;
    shares: DistributeSharesResponse;
  }) {
    await this.createSetupHomeAccountPromiseSingleton({ wallet, shares });
    this._setupPromises.delete(wallet.id);
  }

  protected createSetupHomeAccountPromiseSingleton({
    wallet,
    shares,
  }: {
    wallet: MpcWallet;
    shares: DistributeSharesResponse;
  }) {
    const walletData = wallet.toJSON();
    const result = LocalMpcWalletSchema.safeParse(walletData);
    if (!result.success) {
      return Promise.resolve();
    }

    const pendingPromise = this._setupPromises.get(wallet.id);
    if (pendingPromise) {
      return pendingPromise;
    }

    const promise = this.createSetupHomeAccountPromise({
      wallet,
      walletData: result.data,
      shares,
    });
    this._setupPromises.set(wallet.id, promise);
    return promise;
  }

  protected async createSetupHomeAccountPromise({
    wallet,
    walletData,
    shares,
  }: {
    wallet: MpcWallet;
    walletData: z.infer<typeof LocalMpcWalletSchema>;
    shares: DistributeSharesResponse;
  }) {
    // TODO: pass home chain id to getHomeAccount;
    const homeAccount = await this.getHomeAccount();
    await this.distributeShares({
      homeChainId: wallet.homeChainId,
      homeAccount,
      shares,
    });
    const keyMetaData = this.keyMetaDataStore.getKeyMetaData(wallet.id);
    const previousWalletData = await this.claimHomeAccount({
      homeAccount,
      wallet: walletData,
      keyMetaData,
    });

    const previousWalletId = wallet.id;
    wallet.setUserEntryAddress(homeAccount.homeAccountAddress);
    wallet.setPreviousWalletData(previousWalletData);
    const nextWalletId = wallet.id;
    this.keyMetaDataStore.changeId(previousWalletId, nextWalletId);
    this.targetChainsStore.changeId(previousWalletId, nextWalletId);
    this.userDataStore.changeId(previousWalletId, nextWalletId);
    this.viewingKeysStore.changeId(previousWalletId, nextWalletId);
  }

  protected async getHomeAccount() {
    const homeAccount = await this.createHomeAccountSingleton();
    this._homeAccountPromise = undefined;
    await this.clearUnclaimedHomeAccount();
    return homeAccount;
  }

  protected async distributeShares({
    homeChainId,
    homeAccount,
    shares,
  }: {
    homeChainId: HomeChainId;
    homeAccount: UnclaimedHomeAccount;
    shares: DistributeSharesResponse;
  }) {
    return await this.withRetry(async () => {
      const response = await fetch("/api/setup/distribute-shares", {
        method: "POST",
        body: serialize({
          homeChainId,
          networkParticipants: shares.networkParticipants,
          networkShare: shares.networkShare,
          userEntryAddress: homeAccount.homeAccountAddress,
          userEntryCodeHash: await HomeChain.chainId(
            homeChainId,
          ).userEntryCodeHash(homeAccount.homeAccountAddress),
          ownerIndex: homeAccount.ownerIndex,
        }),
      });

      if (response.status !== 200) {
        throw new Error(`Failed to distribute shares: ${response.status}`);
      }

      const result: { success: boolean } = await response.json();
      if (!result.success) {
        throw new Error("Failed to distribute shares");
      }
    });
  }

  protected async claimHomeAccount({
    homeAccount,
    wallet,
    keyMetaData,
  }: {
    homeAccount: UnclaimedHomeAccount;
    wallet: z.infer<typeof LocalMpcWalletSchema>;
    keyMetaData: KeyMetaData;
  }) {
    return await this.withRetry(async () => {
      const homeChain = HomeChain.chainId(wallet.homeChain);
      const walletData = await homeChain.getWalletData({
        wallet: {
          ...wallet,
          userEntryAddress: homeAccount.homeAccountAddress,
        },
        keyMetaData,
      });

      const userEntryCodeHash = await homeChain.userEntryCodeHash(
        homeAccount.homeAccountAddress,
      );
      const userAccount = await homeChain.userAccount({
        userEntryAddress: homeAccount.homeAccountAddress,
        userEntryCodeHash,
      });

      const multisigKey = MultisigKey.create(wallet.homeChain, wallet.owner);

      const response = await fetch("/api/setup/first-update-owner", {
        method: "POST",
        body: serialize({
          homeChainId: wallet.homeChain,
          owner: wallet.owner,
          ownerAddress: multisigKey.address,
          userEntryAddress: homeAccount.homeAccountAddress,
          userEntryCodeHash,
          userAccountAddress: userAccount.userAccountAddress,
          userAccountCodeHash: userAccount.userAccountCodeHash,
          ownerIndex: homeAccount.ownerIndex,
          walletData,
        }),
      });

      if (response.status !== 200) {
        throw new Error(`Failed to update owner: ${response.status}`);
      }

      const result: { success: boolean } = await response.json();
      if (!result.success) {
        throw new Error(`Failed to update owner: ${serialize(response)}`);
      }

      return walletData;
    });
  }

  protected createHomeAccountSingleton(): Promise<UnclaimedHomeAccount> {
    if (this._homeAccountPromise) return this._homeAccountPromise;
    this._homeAccountPromise = this.createHomeAccount();
    return this._homeAccountPromise;
  }

  protected async createHomeAccount(): Promise<UnclaimedHomeAccount> {
    return await this.withRetry(async () => {
      const homeAccount = await this.getUnclaimedHomeAccount();

      if (homeAccount) return homeAccount;

      const response = await fetch("/api/setup/home-account", {
        method: "POST",
        body: serialize({
          chainId: SecretJsHomeChainId.MAINNET,
        }),
      });

      if (response.status !== 200) {
        throw new Error(`Failed to create magic account: ${response.status}`);
      }

      const result = UnclaimedHomeAccount.safeParse(await response.json());
      if (!result.success) {
        throw new Error(
          `Failed to parse magic account: ${serialize(result.error)}`,
        );
      }

      await this.setUnclaimedHomeAccount(result.data);
      return result.data;
    });
  }

  protected async getUnclaimedHomeAccount(): Promise<
    UnclaimedHomeAccount | undefined
  > {
    return await this.kvStore.get<UnclaimedHomeAccount>(
      unclaimedHomeAccountKvStoreEntry,
    );
  }

  protected async setUnclaimedHomeAccount(homeAccount: UnclaimedHomeAccount) {
    await this.kvStore.set(unclaimedHomeAccountKvStoreEntry, homeAccount);
  }

  protected async clearUnclaimedHomeAccount() {
    await this.kvStore.set(unclaimedHomeAccountKvStoreEntry, null);
  }

  protected async withRetry<T>(promise: () => Promise<T>) {
    const task = Effect.tryPromise(promise);
    const schedule = Schedule.addDelay(Schedule.recurUpTo("60 seconds"), () => {
      return "1 second";
    });
    return await Effect.runPromise(Effect.retry(task, schedule));
  }
}
