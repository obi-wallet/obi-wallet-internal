import { Config, Feature } from "@obi-wallet/config";
import { action, makeObservable, observable } from "mobx";

export class ConfigStore {
  public config: Config;

  constructor({ initialConfig }: { initialConfig: Config }) {
    this.config = initialConfig;
    makeObservable(this, {
      isFeatureEnabled: false,
      config: observable,
      setConfig: action,
    });
  }

  public setConfig(config: Config) {
    this.config = config;
  }

  public isFeatureEnabled(feature: Feature): boolean {
    return this.config.features[feature];
  }
}
