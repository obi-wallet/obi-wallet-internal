import { KVStore } from "@keplr-wallet/common";
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

import { WalletType } from "./abstract-wallet";
import { MultisigWallet } from "./multisig-wallet";
import {
  SerializedMultisigDemoWallet,
  SerializedMultisigWallet,
  SerializedMultisigWalletData,
} from "./multisig-wallet/serialized-data";
import {
  MigratableSerializedData,
  SerializedData,
  SerializedWallet,
} from "./serialized-data";
import { ChainStore } from "../chain";
import { ConfigStore } from "../config";
import { Entities } from "../entities";
import { ArrayIndex } from "../helpers";

export * from "./multisig-key";
export * from "./multisig-wallet";
export * from "./gatekeeper-config";

export enum WalletState {
  /** We are still loading the data from the KV stores. */
  LOADING = "LOADING",
  /** The data in the KV store was invalid. */
  INVALID = "INVALID",
  /** We successfully loaded the data from the KV stores. */
  READY = "READY",
}

export { MultisigWallet, WalletType };

export type Wallet = MultisigWallet;

// TODO: simplify
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
      if (wallet?.chain !== this.chainStore.currentChain) {
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

  public get type(): WalletType | null {
    return this.currentWallet?.type ?? null;
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

  @computed
  public get readyWallets() {
    return this.wallets.filter((wallet) => wallet.isReady);
  }

  @action
  public async addWallet(serializedWallet: SerializedWallet) {
    const wallet = this.addWalletWithoutSave(serializedWallet);
    await this.save();
    return wallet;
  }

  @action
  protected addWalletWithoutSave = (serializedWallet: SerializedWallet) => {
    const id = Entities.generateId();
    const wallet = this.createWallet({ id, serializedWallet });
    this._wallets.add({ id, entity: wallet });
    this.currentWalletId = id;
    return wallet;
  };

  @action
  public async addMultisigWallet(serializedData: SerializedMultisigWalletData) {
    const wallet: SerializedMultisigWallet = {
      type: "multisig",
      data: serializedData,
    };
    return (await this.addWallet(wallet)) as MultisigWallet;
  }

  @action
  public async addMultisigDemoWallet(
    serializedData: SerializedMultisigWalletData
  ) {
    const wallet: SerializedMultisigDemoWallet = {
      type: "multisig-demo",
      data: serializedData,
    };
    return (await this.addWallet(wallet)) as MultisigWallet;
  }

  @action
  public getWallet(id: string) {
    return this._wallets.get({ id });
  }

  @action
  public async removeWallet(id: string) {
    this._wallets.remove({ id });
    if (this.currentWalletId === id) {
      this.currentWalletId = null;
    }
    await this.save();
  }

  @action
  public async setCurrentWallet(id: string) {
    this.currentWalletId = id;
    await this.save();
  }

  @action
  public async logout() {
    this.currentWalletId = null;
    await this.save();
  }

  protected async init() {
    try {
      const serializedData = await this.getSerializedData();

      const { currentWalletIndex, wallets } =
        MigratableSerializedData.schema.parse(serializedData);

      wallets.forEach(this.addWalletWithoutSave);

      runInAction(() => {
        this.currentWalletId =
          typeof currentWalletIndex === "number"
            ? this._wallets.ids[currentWalletIndex]
            : null;
        this.state = WalletState.READY;
      });

      await this.save();
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
        const result = SerializedWallet.safeParse(wallet);
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

  protected createWallet = ({
    id,
    serializedWallet,
  }: {
    id: string;
    serializedWallet: SerializedWallet;
  }) => {
    const onChange = async () => {
      await this.save();
    };

    switch (serializedWallet.type) {
      case "multisig":
      case "multisig-demo":
        return MultisigWallet.deserialize({ id, serializedWallet, onChange });
    }
  };

  public serializeWalletMeta(meta: WalletMeta): SerializedWalletMeta {
    return {
      walletIndex: this.getWalletIndex(meta.walletId),
      currentAccount:
        this.getWallet(meta.walletId)?.serializeAccount(meta.currentAccount) ??
        null,
    };
  }

  public deserializeWalletMeta(meta: SerializedWalletMeta): WalletMeta {
    const walletId = this._wallets.ids[meta.walletIndex];
    return {
      walletId,
      currentAccount: this.getWallet(walletId).deserializeAccount(
        meta.currentAccount
      ),
    };
  }

  protected async save() {
    const serializedData: SerializedData = {
      currentWalletIndex: this.currentWalletIndex,
      wallets: this._wallets.entities.map((wallet) => wallet.serialize()),
    };
    const data = toJS(serializedData);
    await this.kvStore.set("wallets", data);
  }
}
