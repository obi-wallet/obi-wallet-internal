import { makeObservable, observable } from "mobx";

import { Chain } from "../chains";
import { Language } from "../languages";

export interface Config {
  chains: {
    enabled: Chain[];
    default: Chain;
  };
  languages: {
    enabled: Language[];
    default: Language;
  };
  features: {
    accountsTab: boolean;
    healthChecks: boolean;
    nftTab: boolean;
  };
}

export type Feature = keyof Config["features"];

export class ConfigStore {
  @observable
  public config: Config;

  constructor({ initialConfig }: { initialConfig: Config }) {
    makeObservable(this);
    this.config = initialConfig;
  }

  public isFeatureEnabled(feature: Feature): boolean {
    return this.config.features[feature];
  }
}
