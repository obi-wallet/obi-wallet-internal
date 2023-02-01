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
import { CosmosSinglesigWallet } from "./cosmos-singlesig-wallet";
import { MultisigWallet } from "./multisig-wallet";
import {
  migrateSerializedData,
  SerializedCosmosMultisigWalletAnyVersion,
  SerializedCosmosSinglesigWalletAnyVersion,
  SerializedData,
  SerializedDataAnyVersion,
  SerializedMultisigDemoWallet,
  SerializedMultisigWallet,
  SerializedWallet,
  SerializedWalletAnyVersion,
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
export * from "./cosmos-singlesig-wallet";
export * from "./terra-multisig-wallet";

export enum WalletState {
  /** We are still loading the data from the KV stores. */
  LOADING = "LOADING",
  /** The data in the KV store was invalid. */
  INVALID = "INVALID",
  /** We successfully loaded the data from the KV stores. */
  READY = "READY",
}

export { MultisigWallet, CosmosSinglesigWallet, WalletType };

export type Wallet = MultisigWallet | CosmosSinglesigWallet;

export function isCosmosSinglesigWallet(
  wallet: Wallet | null
): wallet is CosmosSinglesigWallet {
  return wallet?.type === WalletType.CosmosSinglesig;
}

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
  protected readonly legacyKVStores: {
    multisig: KVStore;
    singlesig: KVStore;
  };

  @observable
  protected _wallets: Entities<{
    wallet: CosmosSinglesigWallet | MultisigWallet;
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
    legacyKVStores,
  }: {
    chainStore: ChainStore;
    configStore: ConfigStore;
    kvStore: KVStore;
    legacyKVStores: { multisig: KVStore; singlesig: KVStore };
  }) {
    this.chainStore = chainStore;
    this.configStore = configStore;
    this.kvStore = kvStore;
    this.legacyKVStores = legacyKVStores;
    this._wallets = new Entities();
    makeObservable(this);
    this.__initPromise = this.init();

    autorun(() => {
      const wallet = this.currentWallet;
      if (
        isTerraMultisigWallet(wallet) &&
        wallet.chain !== this.chainStore.currentTerraChain
      ) {
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
      const [serializedData, ...legacyWallets] = await Promise.all([
        this.getSerializedData(),
        this.getSerializedLegacyMultisigData(),
        this.getSerializedLegacySinglesigData(),
      ]);

      let addedLegacyWallets = false;
      legacyWallets.forEach((legacyData) => {
        if (legacyData) {
          serializedData.wallets.push(legacyData);
          addedLegacyWallets = true;
        }
      });

      const { currentWalletIndex, wallets } =
        migrateSerializedData(serializedData);

      wallets.forEach(this.addWalletWithoutSave);

      // If legacy wallets were added, fall back to first wallet
      let walletIndexToUse = currentWalletIndex;
      if (addedLegacyWallets) walletIndexToUse = walletIndexToUse ?? 0;

      runInAction(() => {
        this.currentWalletId =
          typeof walletIndexToUse === "number"
            ? this._wallets.ids[walletIndexToUse]
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

  protected async getSerializedLegacyMultisigData(): Promise<SerializedWalletAnyVersion | null> {
    const data = await this.legacyKVStores.multisig.get("multisig");
    if (!data) return null;

    const wallet = {
      type: "multisig",
      data,
    };
    invariant(
      SerializedCosmosMultisigWalletAnyVersion.is(wallet),
      "Expected key `multisig` to be of type `SerializedMultisigWalletAnyVersion`."
    );
    await this.legacyKVStores.multisig.set("multisig", null);
    return wallet;
  }

  protected async getSerializedLegacySinglesigData(): Promise<SerializedWalletAnyVersion | null> {
    const data = await this.legacyKVStores.singlesig.get("singlesig");
    if (!data) return null;

    const wallet = {
      type: "singlesig",
      data,
    };
    invariant(
      SerializedCosmosSinglesigWalletAnyVersion.is(wallet),
      "Expected key `singlesig` to be of type `SerializedSinglesigWalletAnyVersion`."
    );
    await this.legacyKVStores.singlesig.set("singlesig", null);
    return wallet;
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
      case "cosmos-singlesig":
        return new CosmosSinglesigWallet({
          chainStore: this.chainStore,
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
