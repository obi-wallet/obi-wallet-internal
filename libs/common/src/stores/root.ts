import { APP_PORT } from "@keplr-wallet/router";
import {
  ChainSuggestStore,
  DeferInitialQueryController,
  InteractionStore as KeplrInteractionStore,
  ObservableQueryBase,
  PermissionStore,
  SignInteractionStore as KeplrSignInteractionStore,
} from "@keplr-wallet/stores";

import { AppsStore } from "./apps";
import { ChainStore } from "./chain";
import { Config, ConfigStore } from "./config";
import { DraftsStore } from "./drafts";
import { InAppPurchaseInteractionStore } from "./interaction/in-app-purchase";
import { SignInteractionStore } from "./interaction/sign";
import { TerraSignInteractionStore } from "./interaction/terra-sign";
import { KeplrChainStore } from "./keplr-chain";
import { LanguageStore } from "./language";
import { WalletsStore } from "./wallets";
import { CommunityChainInfoRepo, EmbedChainInfos } from "../config";
import { produceEnv } from "../env";
import { AbstractKVStore, KVStore as DefaultKVStore } from "../kv-store";
import { MessageRequesterInternal } from "../message-requester";
import { RouterUi } from "../router";

export class RootStore {
  public readonly appsStore: AppsStore;
  public readonly chainStore: ChainStore;
  public readonly configStore: ConfigStore;
  public readonly draftsStore: DraftsStore;
  public readonly inAppPurchaseInteractionStore: InAppPurchaseInteractionStore;
  public readonly signInteractionStore: SignInteractionStore;
  public readonly terraSignInteractionStore: TerraSignInteractionStore;
  public readonly languageStore: LanguageStore;
  public readonly walletsStore: WalletsStore;

  // Hide Keplr-related stores by default
  protected readonly keplrChainStore: KeplrChainStore;
  protected readonly keplrChainSuggestStore: ChainSuggestStore;
  protected readonly keplrInteractionStore: KeplrInteractionStore;
  protected readonly keplrPermissionStore: PermissionStore;
  public readonly keplrSignInteractionStore: KeplrSignInteractionStore;

  constructor({
    deviceLanguage,
    initialConfig,
    KVStore = DefaultKVStore,
  }: {
    deviceLanguage: string;
    initialConfig: Config;
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
    this.configStore = new ConfigStore({ initialConfig });
    this.draftsStore = new DraftsStore();
    this.inAppPurchaseInteractionStore = new InAppPurchaseInteractionStore(
      this.keplrInteractionStore
    );
    this.signInteractionStore = new SignInteractionStore(
      this.keplrInteractionStore
    );
    this.terraSignInteractionStore = new TerraSignInteractionStore(
      this.keplrInteractionStore
    );

    this.languageStore = new LanguageStore({
      deviceLanguage,
      configStore: this.configStore,
      kvStore: new KVStore("language-store"),
    });
    this.chainStore = new ChainStore({ configStore: this.configStore });

    this.walletsStore = new WalletsStore({
      chainStore: this.chainStore,
      configStore: this.configStore,
      kvStore: new KVStore("wallets-store"),
      legacyKVStores: {
        multisig: new KVStore("multisig-store"),
        singlesig: new KVStore("singlesig-store"),
      },
    });

    router.listen(APP_PORT);
  }

  public get permissionStore() {
    return this.keplrPermissionStore;
  }
}
