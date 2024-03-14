import { ObservableUserInteractions, UserInteractions } from "@obi-wallet/sdk";

import { WalletsStore } from "./wallets";
import { AbstractKVStore, KVStore as DefaultKVStore } from "../kv-store";

export class RootStore {
  protected readonly _walletsStore: WalletsStore;

  public readonly userInteractionsStore: UserInteractions;

  public constructor(
    KVStore: new (prefix: string) => AbstractKVStore = DefaultKVStore,
  ) {
    this.userInteractionsStore = ObservableUserInteractions.create();
    this._walletsStore = new WalletsStore({
      kvStore: new KVStore("wallets-store"),
    });
  }

  public get walletsStoreState() {
    return this._walletsStore.state;
  }

  public get walletsStore() {
    return this._walletsStore.wallets;
  }

  public get mpcWalletsStore() {
    return this._walletsStore.mpcWallets;
  }
}
