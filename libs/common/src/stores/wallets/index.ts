import {
  Migratable,
  MultisigWallet,
  ObservableMultisigWallet,
  ObservableWallets,
  Serialized,
  Wallets,
  WalletsSchema,
} from "@obi-wallet/sdk";
import {
  action,
  autorun,
  computed,
  makeObservable,
  observable,
  runInAction,
  toJS,
} from "mobx";

import { AbstractKVStore } from "../../kv-store";
import { ChainStore } from "../chain";
import { ConfigStore } from "../config";

export enum WalletState {
  /** We are still loading the data from the KV stores. */
  LOADING = "LOADING",
  /** The data in the KV store was invalid. */
  INVALID = "INVALID",
  /** We successfully loaded the data from the KV stores. */
  READY = "READY",
}

export class WalletsStore {
  protected readonly chainStore: ChainStore;
  protected readonly configStore: ConfigStore;
  protected readonly kvStore: AbstractKVStore;

  @observable
  protected _wallets: Wallets;

  @observable
  public state: WalletState = WalletState.LOADING;

  public __initPromise: Promise<void>;

  constructor({
    chainStore,
    configStore,
    kvStore,
  }: {
    chainStore: ChainStore;
    configStore: ConfigStore;
    kvStore: AbstractKVStore;
  }) {
    this.chainStore = chainStore;
    this.configStore = configStore;
    this.kvStore = kvStore;
    this._wallets = ObservableWallets.create();
    makeObservable(this);
    this.__initPromise = this.init();

    autorun(() => {
      const wallet = this.currentWallet;
      if (wallet?.chainId !== this.chainStore.currentChain) {
        this.logout();
      }
    });
  }

  public toJSON() {
    return toJS(this._wallets.toJSON());
  }

  @computed
  public get currentWallet() {
    return this._wallets.currentWallet;
  }

  public get address(): string | null {
    return this.currentWallet?.address ?? null;
  }

  @computed
  public get wallets() {
    return this._wallets.wallets;
  }

  @action
  public addMultisigWallet(serializedData: Serialized<MultisigWallet>["data"]) {
    const wallet = ObservableMultisigWallet.create({
      type: "multisig",
      data: serializedData,
    });
    this._wallets.upsertWallet(wallet);
    this._wallets.setCurrentWallet(wallet);
    return wallet;
  }

  @action
  public addMultisigDemoWallet(
    serializedData: Serialized<MultisigWallet>["data"]
  ) {
    const wallet = ObservableMultisigWallet.create({
      type: "multisig-demo",
      data: serializedData,
    });
    this._wallets.upsertWallet(wallet);
    this._wallets.setCurrentWallet(wallet);
    return wallet;
  }

  @action
  public getWallet(id: string) {
    return this._wallets.getWalletByProxyAddress(id);
  }

  @action
  public removeWallet(wallet: MultisigWallet) {
    this._wallets.removeWallet(wallet);
  }

  @action
  public setCurrentWallet(wallet: MultisigWallet) {
    this._wallets.setCurrentWallet(wallet);
  }

  @action
  public logout() {
    this._wallets.logout();
  }

  protected async init() {
    try {
      const data = await this.kvStore.get<Migratable<Wallets> | undefined>(
        "wallets"
      );

      runInAction(() => {
        this._wallets = ObservableWallets.create(data);
        this.state = WalletState.READY;
      });

      autorun(async () => {
        const data = WalletsSchema.currentSchema.parse(
          toJS(this._wallets.toJSON())
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
