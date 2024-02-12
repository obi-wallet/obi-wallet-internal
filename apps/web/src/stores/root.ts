import { MpcStore } from "@/stores/mpc";
import { WasmStore } from "@/stores/wasm";
import { Config } from "@obi-wallet/config";
import {
  AbstractKVStore,
  KVStore as DefaultKVStore,
  RootStore as SdkRootStore,
} from "@obi-wallet/headless-ui";

import { UserDataStore } from ".";
import { ChainStore } from "./chain";
import { ConfigStore } from "./config";
import { DraftsStore } from "./drafts";
import { WalletConnectStore } from "@/stores/wallet-connect";

export class RootStore {
  public readonly chainStore: ChainStore;
  public readonly configStore: ConfigStore;
  public readonly draftsStore: DraftsStore;
  public readonly mpcStore: MpcStore;
  public readonly sdkRootStore: SdkRootStore;
  public readonly userDataStore: UserDataStore;
  public readonly walletConnectStore: WalletConnectStore;
  public readonly wasmStore: WasmStore;

  constructor({
    initialConfig,
    KVStore = DefaultKVStore,
  }: {
    deviceLanguage: string;
    initialConfig: Config;
    KVStore?: new (prefix: string) => AbstractKVStore;
  }) {
    this.configStore = new ConfigStore({ initialConfig });
    this.draftsStore = new DraftsStore();
    this.sdkRootStore = new SdkRootStore(KVStore);
    this.userDataStore = new UserDataStore(new KVStore("user-data-store"));
    this.walletConnectStore = new WalletConnectStore();
    this.wasmStore = new WasmStore();

    // TODO: do we still need the chain store, and if so, the reference to walletsStore?
    this.chainStore = new ChainStore({
      configStore: this.configStore,
      walletsStore: this.walletsStore,
    });
    this.mpcStore = new MpcStore({
      kvStore: new KVStore("mpc-store"),
      walletsStore: this.mpcWalletsStore,
      wasmStore: this.wasmStore,
    });
  }

  public get mpcWalletsStore() {
    return this.sdkRootStore.mpcWalletsStore;
  }

  public get walletsStore() {
    return this.sdkRootStore.walletsStore;
  }

  public get walletsStoreState() {
    return this.sdkRootStore.walletsStoreState;
  }

  public get userInteractionsStore() {
    return this.sdkRootStore.userInteractionsStore;
  }
}
