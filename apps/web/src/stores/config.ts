import { Config, Feature } from "@obi-wallet/config";
import { action, observable } from "mobx";

export class ConfigStore {
  @observable public accessor config: Config;

  constructor({ initialConfig }: { initialConfig: Config }) {
    this.config = initialConfig;
  }

  @action
  public setConfig(config: Config) {
    this.config = config;
  }

  public isFeatureEnabled(feature: Feature): boolean {
    return this.config.features[feature];
  }
}
