import { Language } from "@obi-wallet/config";
import { AbstractKVStore } from "@obi-wallet/headless-ui";
import { action, flow, makeObservable, observable, runInAction } from "mobx";

import { ConfigStore } from "./config";
import { toGenerator } from "./helpers/to-generator";

export class LanguageStore {
  protected readonly configStore: ConfigStore;
  protected readonly kvStore: AbstractKVStore;

  public currentLanguage: Language;

  constructor({
    deviceLanguage,
    configStore,
    kvStore,
  }: {
    deviceLanguage: string;
    configStore: ConfigStore;
    kvStore: AbstractKVStore;
  }) {
    this.configStore = configStore;
    const { languages } = configStore.config;

    this.currentLanguage =
      languages.enabled.find((lang) => lang === deviceLanguage) ??
      languages.default;
    this.kvStore = kvStore;
    makeObservable<LanguageStore, "configStore" | "kvStore" | "init" | "save">(
      this,
      {
        configStore: false,
        kvStore: false,
        enabledLanguages: false,
        save: false,
        currentLanguage: observable,
        setCurrentLanguage: action,
        init: flow,
      },
    );
    this.init();
  }

  public get enabledLanguages() {
    return this.configStore.config.languages.enabled;
  }

  protected async *init() {
    const currentLanguage = yield* toGenerator(
      this.kvStore.get<Language | undefined>("currentLanguage"),
    );

    if (currentLanguage && this.enabledLanguages.includes(currentLanguage)) {
      runInAction(() => {
        this.currentLanguage = currentLanguage;
      });
    }
  }

  public setCurrentLanguage(selectedLanguage: Language) {
    this.currentLanguage = selectedLanguage;
    void this.save();
  }

  protected async save() {
    await this.kvStore.set("currentLanguage", this.currentLanguage);
  }
}
