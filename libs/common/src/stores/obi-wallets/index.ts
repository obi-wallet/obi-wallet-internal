import { KVStore } from "@keplr-wallet/common";
import { action, computed, makeObservable, observable, toJS } from "mobx";
import { nanoid } from "nanoid/non-secure";
import invariant from "tiny-invariant";

import { WalletState } from "../wallets";
import { AbstractWallet } from "../wallets/abstract-wallet";
import {
  migrateSerializedData,
  SerializedData,
  SerializedDataAnyVersion,
  SerializedWallet,
} from "./serialized-data";
import { TerraMultisigWallet } from "./terra-multisig-wallet";

export class ObiWalletsStore {
  protected readonly kvStore: KVStore;

  @observable
  protected _wallets: {
    ids: string[];
    entities: Record<
      string,
      { wallet: AbstractWallet; serializedWallet: SerializedWallet }
    >;
  } = { ids: [], entities: {} };

  @observable
  public currentWalletId: string | null = null;

  @observable
  public state: WalletState = WalletState.LOADING;

  public __initPromise: Promise<void>;

  constructor({ kvStore }: { kvStore: KVStore }) {
    this.kvStore = kvStore;
    makeObservable(this);
    this.__initPromise = this.init();
  }

  @computed
  public get currentWallet() {
    if (this.currentWalletId === null) return null;
    return this._wallets.entities[this.currentWalletId].wallet;
  }

  public get address(): string | null {
    return this.currentWallet?.address ?? null;
  }

  @computed
  public get currentWalletIndex() {
    if (!this.currentWalletId) return null;
    const index = this._wallets.ids.indexOf(this.currentWalletId);
    return index === -1 ? null : index;
  }

  @computed
  public get wallets() {
    return this._wallets.ids.map((id) => this._wallets.entities[id].wallet);
  }

  @computed
  public get readyWallets() {
    return this.wallets.filter((wallet) => wallet.isReady);
  }

  @computed
  protected get serializedWallets() {
    return this._wallets.ids.map(
      (id) => this._wallets.entities[id].serializedWallet
    );
  }

  @action
  public async addWallet(serializedWallet: SerializedWallet) {
    const wallet = this.addWalletWithoutSave(serializedWallet);
    await this.save();
    return wallet;
  }

  @action
  protected addWalletWithoutSave = (serializedWallet: SerializedWallet) => {
    const id = nanoid();
    const wallet = this.createWallet({ id, serializedWallet });
    this._wallets.ids.push(id);
    this._wallets.entities[id] = {
      wallet,
      serializedWallet,
    };
    this.currentWalletId = id;
    return wallet;
  };

  @action
  public getWallet(id: string) {
    return this._wallets.entities[id].wallet;
  }

  @action
  public async removeWallet(id: string) {
    this._wallets.ids.splice(this._wallets.ids.indexOf(id), 1);
    delete this._wallets.entities[id];
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
        migrateSerializedData(serializedData);
      wallets.forEach(this.addWalletWithoutSave);
      this.currentWalletId =
        typeof currentWalletIndex === "number"
          ? this._wallets.ids[currentWalletIndex]
          : null;
      this.state = WalletState.READY;
      await this.save();
    } catch (e) {
      const error = e as Error;
      this.state = WalletState.INVALID;
      console.error(error.message);
    }
  }

  protected async getSerializedData(): Promise<SerializedDataAnyVersion> {
    const data = await this.kvStore.get("wallets");
    if (!data) {
      return {
        currentWalletIndex: null,
        wallets: [],
      };
    }

    invariant(
      SerializedDataAnyVersion.is(data),
      "Expected key `wallets` to be of type `SerializedDataAnyVersion`."
    );
    return data;
  }

  protected createWallet = ({
    id,
    serializedWallet,
  }: {
    id: string;
    serializedWallet: SerializedWallet;
  }) => {
    const onChange = async (serializedWallet: SerializedWallet) => {
      this._wallets.entities[id].serializedWallet = serializedWallet;
      await this.save();
    };

    switch (serializedWallet.type) {
      case "terra-multisig":
        return new TerraMultisigWallet({
          id,
          // TODO: should be part of serialized wallet
          // TODO: pass onChange
          chain: "pisco-1",
        });
    }
  };

  protected async save() {
    const serializedData: SerializedData = {
      currentWalletIndex: this.currentWalletIndex,
      wallets: this.serializedWallets,
    };
    const data = toJS(serializedData);
    await this.kvStore.set("wallets", data);
  }
}
