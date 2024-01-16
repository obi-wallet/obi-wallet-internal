import {
  Migratable,
  ObservableWalletConnect,
  WalletConnect,
} from "@obi-wallet/sdk";
import { autorun, observable, toJS } from "mobx";

import { WalletsStore } from "./wallets";
import { AbstractKVStore } from "../kv-store";

export class WalletConnectStore {
  protected readonly kvStore: AbstractKVStore;
  protected readonly walletsStore: WalletsStore;

  @observable public accessor walletConnect: WalletConnect;

  constructor({
    kvStore,
    walletsStore,
  }: {
    kvStore: AbstractKVStore;
    walletsStore: WalletsStore;
  }) {
    this.kvStore = kvStore;
    this.walletsStore = walletsStore;
    this.walletConnect = ObservableWalletConnect.create(walletsStore.wallets);

    void this.init();
  }

  public async recoverConnectors() {
    await this.walletsStore.initPromise;
    const data = await this.kvStore.get<Migratable<WalletConnect> | undefined>(
      "sessions",
    );
    if (!data) return;
    await this.walletConnect.recoverConnectors(data);
  }

  protected async init() {
    void this.recoverConnectors();

    autorun(async () => {
      const data = WalletConnect.schema.currentSchema.parse(
        toJS(this.walletConnect.toJSON()),
      );
      await this.kvStore.set("sessions", data);
    });
  }
}
