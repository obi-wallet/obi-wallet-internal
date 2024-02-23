import { ObservableUserInteractions, UserInteractions } from "@obi-wallet/sdk";

import { EthereumDemoStore } from "./ethereum-demo";
import { WalletsStore } from "./wallets";
import { AbstractKVStore, KVStore as DefaultKVStore } from "../kv-store";

export class RootStore {
  protected readonly _walletsStore: WalletsStore;

  public readonly userInteractionsStore: UserInteractions;
  public readonly ethereumDemoStore: EthereumDemoStore;

  public constructor(
    KVStore: new (prefix: string) => AbstractKVStore = DefaultKVStore,
  ) {
    this.userInteractionsStore = ObservableUserInteractions.create();
    this._walletsStore = new WalletsStore({
      kvStore: new KVStore("wallets-store"),
    });

    this.ethereumDemoStore = new EthereumDemoStore({
      kvStore: new KVStore("ethereum-demo-store"),
      walletsStore: this._walletsStore,
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
