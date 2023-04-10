import {
  AbstractKVStore,
  KVStore as DefaultKVStore,
} from "@obi-wallet/headless-ui";
import { ObservableUserInteractions, UserInteractions } from "@obi-wallet/sdk";
import { autorun } from "mobx";

import { AppsStore } from "./apps";
import { ChainStore } from "./chain";
import { Config, ConfigStore } from "./config";
import { DraftsStore } from "./drafts";
import { LanguageStore } from "./language";
import { WalletConnectStore } from "./wallet-connect";
import { WalletsStore } from "./wallets";

export class RootStore {
  public readonly appsStore: AppsStore;
  public readonly chainStore: ChainStore;
  public readonly configStore: ConfigStore;
  public readonly draftsStore: DraftsStore;
  public readonly languageStore: LanguageStore;
  public readonly walletsStore: WalletsStore;
  public readonly walletConnectStore: WalletConnectStore;
  public readonly userInteractionsStore: UserInteractions;

  // Hide Keplr-related stores by default

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
    this.userInteractionsStore = ObservableUserInteractions.create();
    this.walletsStore = new WalletsStore({
      kvStore: new KVStore("wallets-store"),
    });

    this.languageStore = new LanguageStore({
      deviceLanguage,
      configStore: this.configStore,
      kvStore: new KVStore("language-store"),
    });
    this.chainStore = new ChainStore({ configStore: this.configStore });

    this.walletConnectStore = new WalletConnectStore({
      kvStore: new KVStore("wallet-connect-store"),
      walletsStore: this.walletsStore,
    });

    autorun(() => {
      if (
        this.walletsStore.currentWallet?.chainId !==
        this.chainStore.currentChain
      ) {
        this.walletsStore.logout();
      }
    });
  }
}
