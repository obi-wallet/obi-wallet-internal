import { ObservableUserInteractions, UserInteractions } from "@obi-wallet/sdk";

import { WalletConnectStore } from "./wallet-connect";
import { WalletsStore } from "./wallets";
import { AbstractKVStore, KVStore as DefaultKVStore } from "../kv-store";

export class RootStore {
  public readonly walletConnectStore: WalletConnectStore;
  protected readonly _walletsStore: WalletsStore;
  public readonly userInteractionsStore: UserInteractions;

  public constructor(
    KVStore: new (prefix: string) => AbstractKVStore = DefaultKVStore
  ) {
    this.userInteractionsStore = ObservableUserInteractions.create();
    this._walletsStore = new WalletsStore({
      kvStore: new KVStore("wallets-store"),
    });

    this.walletConnectStore = new WalletConnectStore({
      kvStore: new KVStore("wallet-connect-store"),
      walletsStore: this._walletsStore,
    });
  }

  public get walletsStoreState() {
    return this._walletsStore.state;
  }

  public get walletsStore() {
    return this._walletsStore.wallets;
  }
}
