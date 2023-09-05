import { Config } from "@obi-wallet/config";
import {
  AbstractKVStore,
  KVStore as DefaultKVStore,
  RootStore as SdkRootStore,
} from "@obi-wallet/headless-ui";

import { AppsStore } from "./apps";
import { ChainStore } from "./chain";
import { ConfigStore } from "./config";
import { DraftsStore } from "./drafts";
import { LanguageStore } from "./language";
import { ZauthStore } from "./zauth";

export class RootStore {
  public readonly appsStore: AppsStore;
  public readonly chainStore: ChainStore;
  public readonly configStore: ConfigStore;
  public readonly draftsStore: DraftsStore;
  public readonly languageStore: LanguageStore;
  public readonly sdkRootStore: SdkRootStore;
  public readonly zauthStore: ZauthStore;

  constructor({
    deviceLanguage,
    initialConfig,
    KVStore = DefaultKVStore,
  }: {
    deviceLanguage: string;
    initialConfig: Config;
    KVStore?: new (prefix: string) => AbstractKVStore;
  }) {
    this.appsStore = new AppsStore({ kvStore: new KVStore("apps-store") });
    this.configStore = new ConfigStore({ initialConfig });
    this.draftsStore = new DraftsStore();
    this.sdkRootStore = new SdkRootStore(KVStore);
    this.zauthStore = new ZauthStore();

    this.languageStore = new LanguageStore({
      deviceLanguage,
      configStore: this.configStore,
      kvStore: new KVStore("language-store"),
    });
    this.chainStore = new ChainStore({
      configStore: this.configStore,
      walletsStore: this.walletsStore,
    });
  }

  public get walletConnectStore() {
    return this.sdkRootStore.walletConnectStore;
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
