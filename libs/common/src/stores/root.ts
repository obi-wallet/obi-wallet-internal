import { APP_PORT } from "@keplr-wallet/router";
import {
  ChainSuggestStore,
  DeferInitialQueryController,
  InteractionStore as KeplrInteractionStore,
  SignInteractionStore as KeplrSignInteractionStore,
  ObservableQueryBase,
  PermissionStore,
} from "@keplr-wallet/stores";

import { Chain } from "../chains";
import { CommunityChainInfoRepo, EmbedChainInfos } from "../config";
import { produceEnv } from "../env";
import { AbstractKVStore, KVStore as DefaultKVStore } from "../kv-store";
import { MessageRequesterInternal } from "../message-requester";
import { RouterUi } from "../router";
import { AppsStore } from "./apps";
import { BalancesStore } from "./balances";
import { ChainStore } from "./chain";
import { InAppPurchaseInteractionStore } from "./interaction/in-app-purchase";
import { SignInteractionStore } from "./interaction/sign";
import { KeplrChainStore } from "./keplr-chain";
import { LanguageStore } from "./language";
import { SettingsStore } from "./settings";
import { WalletsStore } from "./wallets";

export class RootStore {
  public readonly appsStore: AppsStore;
  public readonly balancesStore: BalancesStore;
  public readonly chainStore: ChainStore;
  public readonly inAppPurchaseInteractionStore: InAppPurchaseInteractionStore;
  public readonly signInteractionStore: SignInteractionStore;
  public readonly languageStore: LanguageStore;
  public readonly settingsStore: SettingsStore;
  public readonly walletsStore: WalletsStore;

  // Hide Keplr-related stores by default
  protected readonly keplrChainStore: KeplrChainStore;
  protected readonly keplrChainSuggestStore: ChainSuggestStore;
  protected readonly keplrInteractionStore: KeplrInteractionStore;
  protected readonly keplrPermissionStore: PermissionStore;
  public readonly keplrSignInteractionStore: KeplrSignInteractionStore;

  constructor({
    defaultChain,
    deviceLanguage,
    enabledLanguages,
    defaultLanguage,
    KVStore = DefaultKVStore,
  }: {
    defaultChain: Chain;
    deviceLanguage: string;
    enabledLanguages: string[];
    defaultLanguage: string;
    KVStore?: new (prefix: string) => AbstractKVStore;
  }) {
    const router = new RouterUi(produceEnv);
    ObservableQueryBase.experimentalDeferInitialQueryController =
      new DeferInitialQueryController();

    this.keplrInteractionStore = new KeplrInteractionStore(
      router,
      new MessageRequesterInternal()
    );
    this.keplrChainStore = new KeplrChainStore(
      EmbedChainInfos,
      new MessageRequesterInternal(),
      ObservableQueryBase.experimentalDeferInitialQueryController
    );
    this.keplrChainSuggestStore = new ChainSuggestStore(
      this.keplrInteractionStore,
      CommunityChainInfoRepo
    );
    this.keplrPermissionStore = new PermissionStore(
      this.keplrInteractionStore,
      new MessageRequesterInternal()
    );
    this.keplrSignInteractionStore = new KeplrSignInteractionStore(
      this.keplrInteractionStore
    );

    this.appsStore = new AppsStore({ kvStore: new KVStore("apps-store") });
    this.chainStore = new ChainStore({ defaultChain });
    this.inAppPurchaseInteractionStore = new InAppPurchaseInteractionStore(
      this.keplrInteractionStore
    );
    this.signInteractionStore = new SignInteractionStore(
      this.keplrInteractionStore
    );
    this.languageStore = new LanguageStore({
      deviceLanguage,
      enabledLanguages,
      defaultLanguage,
      kvStore: new KVStore("language-store"),
    });
    this.settingsStore = new SettingsStore();

    this.walletsStore = new WalletsStore({
      chainStore: this.chainStore,
      kvStore: new KVStore("wallets-store"),
      legacyKVStores: {
        multisig: new KVStore("multisig-store"),
        singlesig: new KVStore("singlesig-store"),
      },
    });

    this.balancesStore = new BalancesStore({
      chainStore: this.chainStore,
      walletsStore: this.walletsStore,
    });

    router.listen(APP_PORT);
  }

  public get permissionStore() {
    return this.keplrPermissionStore;
  }
}
