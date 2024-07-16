import { TargetChainsStore } from "@/stores/target-chains";
import { Config } from "@obi-wallet/config";
import {
  AbstractKVStore,
  KVStore as DefaultKVStore,
  RootStore as SdkRootStore,
} from "@obi-wallet/headless-ui-store";

import { AlertStore } from "./alert";
import { ChainStore } from "./chain";
import { ConfigStore } from "./config";
import { DraftsStore } from "./drafts";
import { KeyMetaDataStore } from "./key-meta-data";
import { MpcStore } from "./mpc";
import { UserDataStore } from "./user-data";
import { WalletConnectStore } from "./wallet-connect";
import { WasmStore } from "./wasm";

export const rootStore: { current: RootStore | null } = { current: null };

export function createRootStore({ config }: { config: Config }): RootStore {
  if (!rootStore.current) {
    rootStore.current = new RootStore({
      deviceLanguage: "en",
      initialConfig: config,
    });
  }
  return rootStore.current;
}

export class RootStore {
  public readonly alertStore: AlertStore;
  public readonly chainStore: ChainStore;
  public readonly configStore: ConfigStore;
  public readonly draftsStore: DraftsStore;
  public readonly keyMetaDataStore: KeyMetaDataStore;
  public readonly mpcStore: MpcStore;
  public readonly sdkRootStore: SdkRootStore;
  public readonly targetChainsStore: TargetChainsStore;
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
    this.alertStore = new AlertStore();
    this.configStore = new ConfigStore({ initialConfig });
    this.draftsStore = new DraftsStore();
    this.keyMetaDataStore = new KeyMetaDataStore(new KVStore("key-meta-data"));
    this.sdkRootStore = new SdkRootStore(KVStore);
    this.targetChainsStore = new TargetChainsStore(
      new KVStore("target-chains-store"),
    );
    this.userDataStore = new UserDataStore(new KVStore("user-data-store"));
    this.wasmStore = new WasmStore();

    // TODO: do we still need the chain store, and if so, the reference to walletsStore?
    this.chainStore = new ChainStore({
      configStore: this.configStore,
    });
    this.mpcStore = new MpcStore({
      kvStore: new KVStore("mpc-store"),
      walletsStore: this.mpcWalletsStore,
      sdkRootStore: this.sdkRootStore,
      wasmStore: this.wasmStore,
    });
    this.walletConnectStore = new WalletConnectStore({
      walletsStore: this.mpcWalletsStore,
    });
  }

  public get mpcWalletsStore() {
    return this.sdkRootStore.mpcWalletsStore;
  }

  public get walletsStoreState() {
    return this.sdkRootStore.walletsStoreState;
  }

  public get userInteractionsStore() {
    return this.sdkRootStore.userInteractionsStore;
  }
}
