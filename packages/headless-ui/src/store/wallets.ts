import { Migratable, ObservableWallets, Wallets } from "@obi-wallet/sdk";
import { autorun, observable, runInAction, toJS } from "mobx";

import { AbstractKVStore } from "../kv-store";

export enum WalletState {
  /** We are still loading the data from the KV stores. */
  LOADING = "LOADING",
  /** The data in the KV store was invalid. */
  INVALID = "INVALID",
  /** We successfully loaded the data from the KV stores. */
  READY = "READY",
}

export class WalletsStore {
  protected readonly kvStore: AbstractKVStore;

  @observable public accessor state: WalletState = WalletState.LOADING;
  public initPromise: Promise<void>;
  @observable public accessor wallets: Wallets;

  constructor({ kvStore }: { kvStore: AbstractKVStore }) {
    this.kvStore = kvStore;
    this.wallets = ObservableWallets.create();
    this.initPromise = this.init();
  }

  protected async init() {
    try {
      const data = await this.kvStore.get<Migratable<Wallets> | undefined>(
        "wallets",
      );

      runInAction(() => {
        if (data) {
          this.wallets.deserialize(data);
        }
        this.state = WalletState.READY;
      });

      autorun(async () => {
        const data = Wallets.schema.currentSchema.parse(
          toJS(this.wallets.toJSON()),
        );
        await this.kvStore.set("wallets", data);
      });
    } catch (e) {
      const error = e as Error;
      this.state = WalletState.INVALID;
      console.error(error.message);
    }
  }
}
