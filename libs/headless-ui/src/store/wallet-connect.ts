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
  protected readonly walletsStore: WalletsStore;

  public walletConnect: WalletConnect;

  public __initPromise: Promise<void>;

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
    makeObservable<WalletConnectStore, "kvStore" | "walletsStore" | "init">(
      this,
      {
        disconnect: true,
        __initPromise: false,
        walletConnect: observable,
        init: false,
        kvStore: false,
        walletsStore: false,
        connectors: false,
        recoverConnectors: false,
        connect: false,
      }
    );
    this.__initPromise = this.init();
  }

  public get connectors() {
    return this.walletConnect.connectors;
  }

  public async recoverConnectors() {
    await this.walletsStore.initPromise;
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
