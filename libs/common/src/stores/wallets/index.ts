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
import invariant from "tiny-invariant";

import { WalletType } from "./abstract-wallet";
import { MultisigWallet } from "./multisig-wallet";
import {
  migrateSerializedData,
  SerializedData,
  SerializedDataAnyVersion,
  SerializedMultisigDemoWallet,
  SerializedMultisigWallet,
  SerializedWallet,
} from "./serialized-data";
import {
  CosmosChain,
  isCosmosChain,
  isTerraChain,
  TerraChain,
} from "../../chains";
import { ChainStore } from "../chain";
import { ConfigStore } from "../config";
import { Entities } from "../entities";

export * from "./cosmos-multisig-wallet";
export * from "./terra-multisig-wallet";

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

export function isAnyMultisigWallet(
  wallet: Wallet | null
): wallet is MultisigWallet {
  return wallet?.type === WalletType.Multisig;
}

export function isAnyCosmosMultisigWallet(
  wallet: Wallet | null
): wallet is MultisigWallet & { chain: CosmosChain } {
  return isAnyMultisigWallet(wallet) && isCosmosChain(wallet.chain);
}

export function isAnyTerraMultisigWallet(
  wallet: Wallet | null
): wallet is MultisigWallet & { chain: TerraChain } {
  return isAnyMultisigWallet(wallet) && isTerraChain(wallet.chain);
}

export function isMultisigWallet(
  wallet: Wallet | null
): wallet is MultisigWallet & { isDemo: false } {
  return isAnyMultisigWallet(wallet) && !wallet.isDemo;
}

export function isCosmosMultisigWallet(
  wallet: Wallet | null
): wallet is MultisigWallet & { isDemo: false } {
  return isAnyCosmosMultisigWallet(wallet) && !wallet.isDemo;
}

export function isTerraMultisigWallet(
  wallet: Wallet | null
): wallet is MultisigWallet & { isDemo: false } {
  return isAnyTerraMultisigWallet(wallet) && !wallet.isDemo;
}

export function isMultisigDemoWallet(
  wallet: Wallet | null
): wallet is MultisigWallet & { isDemo: true } {
  return isAnyMultisigWallet(wallet) && wallet.isDemo;
}

export class WalletsStore {
  protected readonly chainStore: ChainStore;
  protected readonly configStore: ConfigStore;
  protected readonly kvStore: KVStore;

  @observable
  protected _wallets: Entities<{
    wallet: Wallet;
    serializedWallet: SerializedWallet;
  }>;
  @observable
  public currentWalletId: string | null = null;
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
    if (this.currentWalletId === null) return null;
    return this._wallets.get({ id: this.currentWalletId }).wallet;
  }

  public get type(): WalletType | null {
    return this.currentWallet?.type ?? null;
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
    return this._wallets.entities.map((entity) => entity.wallet);
  }

  @computed
  public get readyWallets() {
    return this.wallets.filter((wallet) => wallet.isReady);
  }

  @computed
  protected get serializedWallets() {
    return this._wallets.entities.map((entity) => entity.serializedWallet);
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
    this._wallets.add({ id, entity: { wallet, serializedWallet } });
    this.currentWalletId = id;
    return wallet;
  };

  @action
  public async addMultisigWallet(
    serializedData: SerializedMultisigWallet["data"]
  ) {
    const wallet: SerializedMultisigWallet = {
      type: "multisig",
      data: serializedData,
    };
    return (await this.addWallet(wallet)) as MultisigWallet;
  }

  @action
  public async addMultisigDemoWallet(
    serializedData: SerializedMultisigDemoWallet["data"]
  ) {
    const wallet: SerializedMultisigDemoWallet = {
      type: "multisig-demo",
      data: serializedData,
    };
    return (await this.addWallet(wallet)) as MultisigWallet;
  }

  @action
  public getWallet(id: string) {
    return this._wallets.get({ id }).wallet;
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
        migrateSerializedData(serializedData);

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

  public async getSerializedData(): Promise<SerializedDataAnyVersion> {
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
      this._wallets.get({ id }).serializedWallet = serializedWallet;
      await this.save();
    };

    switch (serializedWallet.type) {
      case "multisig":
      case "multisig-demo":
        return new MultisigWallet({
          id,
          serializedWallet,
          onChange,
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
