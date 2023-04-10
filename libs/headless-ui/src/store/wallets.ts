import {
  Migratable,
  MultisigKey,
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
  protected _wallets: Wallets;

  public state: WalletState = WalletState.LOADING;
  public __initPromise: Promise<void>;

  constructor({ kvStore }: { kvStore: AbstractKVStore }) {
    this.kvStore = kvStore;
    this._wallets = ObservableWallets.create();
    makeObservable<WalletsStore, "init" | "kvStore" | "_wallets">(this, {
      kvStore: false,
      __initPromise: false,
      _wallets: observable,
      state: observable,
      currentWallet: computed,
      wallets: computed,
      addMultisigWallet: action,
      addMultisigDemoWallet: action,
      createWallet: action,
      recoverWallet: action,
      removeWallet: action,
      setCurrentWallet: action,
      logout: action,
      toJSON: false,
      getWallet: false,
      init: false,
      address: computed,
    });
    this.__initPromise = this.init();
  }

  public toJSON() {
    return toJS(this._wallets.toJSON());
  }

  public get currentWallet() {
    return this._wallets.currentWallet;
  }

  public get address(): string | null {
    return this.currentWallet?.address ?? null;
  }

  public get wallets() {
    return this._wallets.wallets;
  }

  public addMultisigWallet(serializedData: Serialized<MultisigWallet>["data"]) {
    const wallet = ObservableMultisigWallet.create({
      type: "multisig",
      data: serializedData,
    });
    this._wallets.upsertWallet(wallet);
    this._wallets.setCurrentWallet(wallet);
    return wallet;
  }

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

  public createWallet({
    multisigKey,
    demoMode,
  }: {
    multisigKey: MultisigKey;
    demoMode: boolean;
  }) {
    return this._wallets.createWallet({ multisigKey, demoMode });
  }

  public recoverWallet({
    serializedData,
    newOwner,
  }: {
    serializedData: Serialized<MultisigWallet>["data"];
    newOwner: MultisigKey;
  }) {
    return this._wallets.recoverWallet({ serializedData, newOwner });
  }

  public getWallet(id: string) {
    return this._wallets.getWalletByProxyAddress(id);
  }

  public removeWallet(wallet: MultisigWallet) {
    this._wallets.removeWallet(wallet);
  }

  public setCurrentWallet(wallet: MultisigWallet) {
    this._wallets.setCurrentWallet(wallet);
  }

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
