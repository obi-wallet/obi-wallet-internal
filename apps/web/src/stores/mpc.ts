import { distributeShares } from "@/lib/mpc";
import { WasmStore } from "@/stores/wasm";
import { AbstractKVStore } from "@obi-wallet/headless-ui";
import { Wallets } from "@obi-wallet/sdk";
import { autorun } from "mobx";

export type UnclaimedShares = Awaited<ReturnType<typeof distributeShares>>;

const unclaimedSharesKvStoreEntry = "shares";

export class MpcStore {
  protected readonly walletsStore: Wallets;
  protected readonly wasmStore: WasmStore;
  protected readonly unclaimedSharesKVStore: AbstractKVStore;
  protected _sharesPromise: Promise<UnclaimedShares> | undefined;

  constructor({
    kvStore,
    walletsStore,
    wasmStore,
  }: {
    kvStore: AbstractKVStore;
    walletsStore: Wallets;
    wasmStore: WasmStore;
  }) {
    this.unclaimedSharesKVStore = kvStore;
    this.walletsStore = walletsStore;
    this.wasmStore = wasmStore;

    autorun(() => {
      if (!this.walletsStore.currentWallet) {
        void this.createSharesSingleton();
      }
    });
  }

  public async getShares() {
    const shares = await this.createSharesSingleton();
    this._sharesPromise = undefined;
    await this.clearUnclaimedShares();
    return shares;
  }

  protected createSharesSingleton(): Promise<UnclaimedShares> {
    if (this._sharesPromise) return this._sharesPromise;
    this._sharesPromise = this.createShares();
    return this._sharesPromise;
  }

  protected async createShares(): Promise<UnclaimedShares> {
    const shares = await this.getUnclaimedShares();

    if (shares) return shares;

    const unclaimedShares = await distributeShares();
    await this.setUnclaimedShares(unclaimedShares);
    return unclaimedShares;
  }

  protected async getUnclaimedShares(): Promise<UnclaimedShares | undefined> {
    const data = await this.unclaimedSharesKVStore.get<unknown>(
      unclaimedSharesKvStoreEntry,
    );
    if (!data) return undefined;
    return data as UnclaimedShares;
  }

  protected async setUnclaimedShares(shares: UnclaimedShares) {
    await this.unclaimedSharesKVStore.set(unclaimedSharesKvStoreEntry, shares);
  }

  protected async clearUnclaimedShares() {
    await this.unclaimedSharesKVStore.set(unclaimedSharesKvStoreEntry, null);
  }
}
