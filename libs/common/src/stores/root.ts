import { Config } from "@obi-wallet/config";
import {
  AbstractKVStore,
  KVStore as DefaultKVStore,
  RootStore as SdkRootStore,
} from "@obi-wallet/headless-ui";
import { Secp256k1KeyPair } from "@obi-wallet/sdk";
import { action, makeObservable } from "mobx";

import { AppsStore } from "./apps";
import { ChainStore } from "./chain";
import { ConfigStore } from "./config";
import { DraftsStore } from "./drafts";
import { LanguageStore } from "./language";
import { UnityStore } from "./unity";
import { ZauthStore } from "./zauth";

class PhoneSessionStore {
  protected kp: Secp256k1KeyPair | null;

  constructor({ kp }: { kp: Secp256k1KeyPair | null }) {
    this.kp = kp;
    makeObservable<PhoneSessionStore, "kp" | "getKp" | "setKp">(this, {
      kp: false,
      getKp: false,
      setKp: action,
    });
  }

  public setKp(kp: Secp256k1KeyPair) {
    this.kp = kp;
  }

  public get getKp() {
    return this.kp;
  }
}

export class RootStore {
  public readonly appsStore: AppsStore;
  public readonly chainStore: ChainStore;
  public readonly configStore: ConfigStore;
  public readonly draftsStore: DraftsStore;
  public readonly languageStore: LanguageStore;
  public readonly phoneSessionStore: PhoneSessionStore;
  public readonly sdkRootStore: SdkRootStore;
  public readonly unityStore: UnityStore;
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
    this.phoneSessionStore = new PhoneSessionStore({ kp: null });
    this.sdkRootStore = new SdkRootStore(KVStore);
    this.unityStore = new UnityStore();
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
