import {
  Migratable,
  ObservableWalletConnect,
  WalletConnect,
  WalletConnectConnector,
  WalletMeta,
} from "@obi-wallet/sdk";
import { autorun, makeObservable, observable, toJS } from "mobx";

import { WalletsStore } from "./wallets";
import { AbstractKVStore } from "../kv-store";

export class WalletConnectStore {
  protected readonly kvStore: AbstractKVStore;

  protected walletConnect: WalletConnect;

  public __initPromise: Promise<void>;

  constructor({
    kvStore,
    walletsStore,
  }: {
    kvStore: AbstractKVStore;
    walletsStore: WalletsStore;
  }) {
    this.kvStore = kvStore;
    this.walletConnect = ObservableWalletConnect.create(walletsStore._wallets);
    makeObservable<WalletConnectStore, "kvStore" | "walletConnect" | "init">(
      this,
      {
        disconnect: true,
        __initPromise: false,
        init: false,
        kvStore: false,
        connectors: false,
        recoverConnectors: false,
        connect: false,
        walletConnect: observable,
      }
    );
    this.__initPromise = this.init();
  }

  public get connectors() {
    return this.walletConnect.connectors;
  }

  public async recoverConnectors() {
    const data = await this.kvStore.get<Migratable<WalletConnect> | undefined>(
      "sessions"
    );
    if (!data) return;
    await this.walletConnect.recoverConnectors(data);
  }

  public async connect({
    uri,
    walletMeta,
  }: {
    uri: string;
    walletMeta: WalletMeta;
  }) {
    await this.walletConnect.connect({ uri, walletMeta });
  }

  public async disconnect(connector: WalletConnectConnector) {
    await this.walletConnect.disconnect(connector);
  }

  protected async init() {
    void this.recoverConnectors();

    autorun(async () => {
      const data = WalletConnect.schema.currentSchema.parse(
        toJS(this.walletConnect.toJSON())
      );
      await this.kvStore.set("sessions", data);
    });
  }
}
