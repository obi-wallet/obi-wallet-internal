import { CURRENT_WALLET_COOKIE_NAME } from "@/lib/current-wallet";
import { AnalyticsStore } from "@/stores/analytics";
import { walletsStorage as defaultWalletsStorage } from "@/stores/storage/wallets";
import { Config } from "@obi-wallet/config";
import {
  AbstractKVStore,
  KVStore as DefaultKVStore,
  RootStore as SdkRootStore,
  WalletsStorage,
} from "@obi-wallet/headless-ui-store";
import Cookies from "js-cookie";
import { autorun } from "mobx";

import { AlertStore } from "./alert";
import { ChainStore } from "./chain";
import { ConfigStore } from "./config";
import { DraftsStore } from "./drafts";
import { KeyMetaDataStore } from "./key-meta-data";
import { MpcStore } from "./mpc";
import { TargetChainsStore } from "./target-chains";
import { TokensStore } from "./tokens";
import { UserDataStore } from "./user-data";
import { ViewingKeysStore } from "./viewing-keys";
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
  public readonly analyticsStore: AnalyticsStore;
  public readonly chainStore: ChainStore;
  public readonly configStore: ConfigStore;
  public readonly draftsStore: DraftsStore;
  public readonly keyMetaDataStore: KeyMetaDataStore;
  public readonly mpcStore: MpcStore;
  public readonly sdkRootStore: SdkRootStore;
  public readonly targetChainsStore: TargetChainsStore;
  public readonly tokensStore: TokensStore;
  public readonly userDataStore: UserDataStore;
  public readonly viewingKeysStore: ViewingKeysStore;
  public readonly walletConnectStore: WalletConnectStore;
  public readonly wasmStore: WasmStore;

  constructor({
    initialConfig,
    KVStore = DefaultKVStore,
    walletsStorage = defaultWalletsStorage,
  }: {
    deviceLanguage: string;
    initialConfig: Config;
    KVStore?: new (prefix: string) => AbstractKVStore;
    walletsStorage?: WalletsStorage;
  }) {
    this.alertStore = new AlertStore();
    this.configStore = new ConfigStore({ initialConfig });
    this.draftsStore = new DraftsStore();
    this.keyMetaDataStore = new KeyMetaDataStore(new KVStore("key-meta-data"));
    this.sdkRootStore = new SdkRootStore({
      walletsStorage,
    });
    this.targetChainsStore = new TargetChainsStore(
      new KVStore("target-chains-store"),
    );
    this.tokensStore = new TokensStore(new KVStore("tokens-store"));
    this.userDataStore = new UserDataStore(new KVStore("user-data-store"));
    this.viewingKeysStore = new ViewingKeysStore(
      new KVStore("viewing-keys-store"),
    );
    this.wasmStore = new WasmStore();

    this.analyticsStore = new AnalyticsStore({
      kvStore: new KVStore("analytics-store"),
      walletsStore: this.mpcWalletsStore,
    });
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
      analyticsStore: this.analyticsStore,
      walletsStore: this.mpcWalletsStore,
    });

    autorun(() => {
      const currentWallet = this.mpcWalletsStore.currentWallet;
      if (currentWallet) {
        Cookies.set(CURRENT_WALLET_COOKIE_NAME, currentWallet.userEntryAddress);
      } else {
        Cookies.remove(CURRENT_WALLET_COOKIE_NAME);
      }
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
