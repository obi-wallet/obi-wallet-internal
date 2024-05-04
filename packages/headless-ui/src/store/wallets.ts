import { Migratable, MpcWallets, ObservableMpcWallets } from "@obi-wallet/sdk";
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
  @observable public accessor mpcWallets: MpcWallets;

  constructor({ kvStore }: { kvStore: AbstractKVStore }) {
    this.kvStore = kvStore;
    this.mpcWallets = ObservableMpcWallets.create();
    this.initPromise = this.init();
  }

  protected async init() {
    try {
      const data = await this.kvStore.get<Migratable<MpcWallets> | undefined>(
        "mpc-wallets",
      );

      runInAction(() => {
        if (data) {
          this.mpcWallets.deserialize(data);
        }
        this.state = WalletState.READY;
      });

      autorun(async () => {
        const data = MpcWallets.schema.currentSchema.parse(
          toJS(this.mpcWallets.toJSON()),
        );
        await this.kvStore.set("mpc-wallets", data);
      });
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const error = e as Error;
      runInAction(() => {
        this.state = WalletState.INVALID;
      });
      console.error(error.message);
    }
  }
}
