import {
  Migratable,
  MpcWallets,
  ObservableMpcWallets,
  ObservableWallets,
  Wallets,
} from "@obi-wallet/sdk";
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
  @observable public accessor mpcWallets: MpcWallets;

  constructor({ kvStore }: { kvStore: AbstractKVStore }) {
    this.kvStore = kvStore;
    this.wallets = ObservableWallets.create();
    this.mpcWallets = ObservableMpcWallets.create();
    this.initPromise = this.init();
  }

  protected async init() {
    try {
      const [legacyData, data] = await Promise.all([
        this.kvStore.get<Migratable<Wallets> | undefined>("wallets"),
        this.kvStore.get<Migratable<MpcWallets> | undefined>("mpc-wallets"),
      ]);

      runInAction(() => {
        if (legacyData) {
          this.wallets.deserialize(legacyData);
        }
        if (data) {
          this.mpcWallets.deserialize(data);
        }
        this.state = WalletState.READY;
      });

      autorun(async () => {
        const legacyData = Wallets.schema.currentSchema.parse(
          toJS(this.wallets.toJSON()),
        );
        const data = MpcWallets.schema.currentSchema.parse(
          toJS(this.mpcWallets.toJSON()),
        );
        await Promise.all([
          this.kvStore.set("wallets", legacyData),
          this.kvStore.set("mpc-wallets", data),
        ]);
      });
    } catch (e) {
      const error = e as Error;
      this.state = WalletState.INVALID;
      console.error(error.message);
    }
  }
}
