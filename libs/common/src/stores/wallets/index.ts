import { KVStore } from "@keplr-wallet/common";
import {
  createObservableMultisigWallet,
  MultisigWallet as MultisigWalletSdk,
  ObservableGatekeeperConfig,
  ObservableMultisigKey,
  Serialized,
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
import * as R from "ramda";
import invariant from "tiny-invariant";
import { z } from "zod";

import { MigratableSerializedData, SerializedData } from "./serialized-data";
import { ChainStore } from "../chain";
import { ConfigStore } from "../config";
import { Entities } from "../entities";
import { ArrayIndex } from "../helpers";

export * from "./multisig-wallet";

export enum WalletState {
  /** We are still loading the data from the KV stores. */
  LOADING = "LOADING",
  /** The data in the KV store was invalid. */
  INVALID = "INVALID",
  /** We successfully loaded the data from the KV stores. */
  READY = "READY",
}

export type MultisigWallet = MultisigWalletSdk<
  ObservableGatekeeperConfig,
  ObservableMultisigKey
>;
export type Wallet = MultisigWalletSdk<
  ObservableGatekeeperConfig,
  ObservableMultisigKey
>;

export type WalletMeta = {
  walletId: string;
  currentAccount: {
    type: "flex-account" | "singlesig-wallet";
    index: number;
  } | null;
};

export interface SerializedWalletMeta {
  walletIndex: number;
  currentAccount: {
    type: "flex-account" | "singlesig-wallet";
    index: number;
  } | null;
}

export class WalletsStore {
  protected readonly chainStore: ChainStore;
  protected readonly configStore: ConfigStore;
  protected readonly kvStore: KVStore;

  @observable
  protected _wallets: Entities<Wallet>;
  @observable
  protected currentWalletId: string | null = null;
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
    kvStore: KVStore;
  }) {
    this.chainStore = chainStore;
    this.configStore = configStore;
    this.kvStore = kvStore;
    this._wallets = new Entities();
    makeObservable(this);
    this.__initPromise = this.init();

    autorun(() => {
      const wallet = this.currentWallet;
      if (wallet?.chainId !== this.chainStore.currentChain) {
        runInAction(() => {
          this.currentWalletId = null;
        });
      }
    });
  }

  @computed
  public get currentWallet() {
    if (!this.currentWalletId) return null;
    return this._wallets.get({ id: this.currentWalletId });
  }

  public get address(): string | null {
    return this.currentWallet?.address ?? null;
  }

  public getWalletIndex(id: string) {
    return this._wallets.ids.indexOf(id);
  }

  @computed
  public get currentWalletIndex() {
    if (!this.currentWalletId) return null;
    return this.getWalletIndex(this.currentWalletId);
  }

  @computed
  public get wallets() {
    return this._wallets.entities;
  }

  @action
  protected addWallet = (
    serializedWallet: Serialized<typeof MultisigWalletSdk>
  ) => {
    const wallet = createObservableMultisigWallet(serializedWallet);
    const id = wallet.id;
    this._wallets.add({ id, entity: wallet });
    this.currentWalletId = id;
    return wallet;
  };

  @action
  public addMultisigWallet(
    serializedData: Serialized<typeof MultisigWalletSdk>["data"]
  ) {
    return this.addWallet({
      type: "multisig",
      data: serializedData,
    });
  }

  @action
  public addMultisigDemoWallet(
    serializedData: Serialized<typeof MultisigWalletSdk>["data"]
  ) {
    return this.addWallet({
      type: "multisig-demo",
      data: serializedData,
    });
  }

  @action
  public getWallet(id: string) {
    return this._wallets.get({ id });
  }

  @action
  public removeWallet(id: string) {
    this._wallets.remove({ id });
    if (this.currentWalletId === id) {
      this.currentWalletId = null;
    }
  }

  @action
  public setCurrentWallet(id: string) {
    this.currentWalletId = id;
  }

  @action
  public logout() {
    this.currentWalletId = null;
  }

  protected async init() {
    try {
      const serializedData = await this.getSerializedData();

      const { currentWalletIndex, wallets } =
        MigratableSerializedData.schema.parse(serializedData);

      wallets.forEach(this.addWallet);

      runInAction(() => {
        this.currentWalletId =
          typeof currentWalletIndex === "number"
            ? this._wallets.ids[currentWalletIndex]
            : null;
        this.state = WalletState.READY;
      });

      autorun(async () => {
        const serializedData: SerializedData = {
          currentWalletIndex: this.currentWalletIndex,
          wallets: this._wallets.entities.map((wallet) => wallet.toJSON()),
        };
        const data = toJS(serializedData);
        await this.kvStore.set("wallets", data);
      });
    } catch (e) {
      const error = e as Error;
      this.state = WalletState.INVALID;
      console.error(error.message);
    }
  }

  public async getSerializedData(): Promise<
    z.input<typeof MigratableSerializedData.schema>
  > {
    const data = await this.kvStore.get("wallets");
    if (!data) {
      return {
        currentWalletIndex: null,
        wallets: [],
      };
    }

    try {
      return MigratableSerializedData.schema.parse(data);
    } catch (e) {
      invariant(
        R.has("currentWalletIndex", data),
        "Expected key `data.currentWalletIndex` to be present."
      );
      invariant(
        R.has("wallets", data),
        "Expected key `data.wallets` to be present."
      );

      const currentWalletIndex = data.currentWalletIndex;
      const wallets = data.wallets;

      invariant(
        Array.isArray(wallets),
        "Expected key `data.wallets` to be an array."
      );

      const validWallets = wallets.filter((wallet) => {
        const result =
          MultisigWalletSdk.schema.migratableSchema.safeParse(wallet);
        return result.success;
      });

      const newCurrentWalletIndex = (() => {
        const result = ArrayIndex.safeParse(currentWalletIndex);
        if (result.success && validWallets.length > 0) {
          let index = R.min(result.data, validWallets.length - 1);
          index -= wallets.length - validWallets.length;
          return index;
        }

        return null;
      })();

      return {
        currentWalletIndex: newCurrentWalletIndex,
        wallets: validWallets,
      };
    }
  }

  public serializeWalletMeta(meta: WalletMeta): SerializedWalletMeta {
    return {
      walletIndex: this.getWalletIndex(meta.walletId),
      currentAccount: this.getWallet(meta.walletId)?.currentAccountMeta ?? null,
    };
  }

  public deserializeWalletMeta(meta: SerializedWalletMeta): WalletMeta {
    const walletId = this._wallets.ids[meta.walletIndex];
    return {
      walletId,
      currentAccount: meta.currentAccount,
    };
  }
}
