import { APP_PORT } from "@keplr-wallet/router";
import { InteractionStore as KeplrInteractionStore } from "@keplr-wallet/stores";

import { AppsStore } from "./apps";
import { ChainStore } from "./chain";
import { Config, ConfigStore } from "./config";
import { DraftsStore } from "./drafts";
import { InAppPurchaseInteractionStore } from "./interaction/in-app-purchase";
import { SignInteractionStore } from "./interaction/sign";
import { TerraSignInteractionStore } from "./interaction/terra-sign";
import { WalletConnectInteractionStore } from "./interaction/wallet-connect";
import { LanguageStore } from "./language";
import { WalletConnectStore } from "./wallet-connect";
import { WalletsStore } from "./wallets";
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
  public readonly walletConnectInteractionStore: WalletConnectInteractionStore;
  public readonly walletConnectStore: WalletConnectStore;

  // Hide Keplr-related stores by default
  protected readonly keplrInteractionStore: KeplrInteractionStore;

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

    this.keplrInteractionStore = new KeplrInteractionStore(
      router,
      new MessageRequesterInternal()
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
    this.walletConnectInteractionStore = new WalletConnectInteractionStore(
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
    });

    this.walletConnectStore = new WalletConnectStore({
      kvStore: new KVStore("wallet-connect-store"),
      walletsStore: this.walletsStore,
    });

    router.listen(APP_PORT);
  }
}
