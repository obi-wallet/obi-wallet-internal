import { ObservableUserInteractions, UserInteractions } from "@obi-wallet/sdk";

import { WalletsStore } from "./wallets";
import { AbstractKVStore, KVStore as DefaultKVStore } from "../kv-store";

export class RootStore {
  public readonly walletsStore: WalletsStore;
  public readonly userInteractionsStore: UserInteractions;

  public constructor(
    KVStore: new (prefix: string) => AbstractKVStore = DefaultKVStore
  ) {
    this.userInteractionsStore = ObservableUserInteractions.create();
    this.walletsStore = new WalletsStore({
      kvStore: new KVStore("wallets-store"),
    });
  }
}
