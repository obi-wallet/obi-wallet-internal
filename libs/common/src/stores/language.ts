import { KVStore, toGenerator } from "@keplr-wallet/common";
import { action, flow, makeObservable, observable, runInAction } from "mobx";

import { Language } from "../languages";
import { ConfigStore } from "./config";

export class LanguageStore {
  protected readonly configStore: ConfigStore;
  protected readonly kvStore: KVStore;

  @observable
  public currentLanguage: Language;

  constructor({
    deviceLanguage,
    configStore,
    kvStore,
  }: {
    deviceLanguage: string;
    configStore: ConfigStore;
    kvStore: KVStore;
  }) {
    this.configStore = configStore;
    const { languages } = configStore.config;

    this.currentLanguage =
      languages.enabled.find((lang) => lang === deviceLanguage) ??
      languages.default;
    this.kvStore = kvStore;
    makeObservable(this);
    this.init();
  }

  public get enabledLanguages() {
    return this.configStore.config.languages.enabled;
  }

  @flow
  protected async *init() {
    const currentLanguage = yield* toGenerator(
      this.kvStore.get<Language | undefined>("currentLanguage")
    );

    if (currentLanguage && this.enabledLanguages.includes(currentLanguage)) {
      runInAction(() => {
        this.currentLanguage = currentLanguage;
      });
    }
  }

  @action
  public setCurrentLanguage(selectedLanguage: Language) {
    this.currentLanguage = selectedLanguage;
    void this.save();
  }

  protected async save() {
    await this.kvStore.set("currentLanguage", this.currentLanguage);
  }
}
