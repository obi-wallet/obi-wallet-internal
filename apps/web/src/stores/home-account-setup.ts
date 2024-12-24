import { AbstractKVStore } from "@obi-wallet/headless-ui-store";
import {
  MpcWallets,
  SecretJsHomeChainId,
  UserEntryAddress,
} from "@obi-wallet/sdk";
import { serialize } from "@obi-wallet/sdk-json";
import { z } from "zod";

const UnclaimedHomeAccount = z.object({
  homeAccountAddress: UserEntryAddress,
  ownerAddress: z.string(),
  ownerIndex: z.number(),
});

type UnclaimedHomeAccount = z.TypeOf<typeof UnclaimedHomeAccount>;

const unclaimedHomeAccountKvStoreEntry = "home-account";

export class HomeAccountSetupStore {
  protected readonly walletsStore: MpcWallets;
  protected readonly kvStore: AbstractKVStore;
  protected _homeAccountPromise: Promise<UnclaimedHomeAccount> | undefined;

  constructor({
    walletsStore,
    kvStore,
  }: {
    walletsStore: MpcWallets;
    kvStore: AbstractKVStore;
  }) {
    this.walletsStore = walletsStore;
    this.kvStore = kvStore;
  }

  public async setup() {
    const homeAcc = await this.createHomeAccountSingleton();
    console.log(homeAcc);
  }

  // TODO: probably protected and only used by other methods;
  public async getHomeAccount() {
    const homeAccount = await this.createHomeAccountSingleton();
    this._homeAccountPromise = undefined;
    await this.clearUnclaimedHomeAccount();
    return homeAccount;
  }

  protected createHomeAccountSingleton(): Promise<UnclaimedHomeAccount> {
    if (this._homeAccountPromise) return this._homeAccountPromise;
    this._homeAccountPromise = this.createHomeAccount();
    return this._homeAccountPromise;
  }

  protected async createHomeAccount(): Promise<UnclaimedHomeAccount> {
    // TODO: handle retry;

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
}
