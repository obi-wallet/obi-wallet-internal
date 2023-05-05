import { ChainId, KeyType } from "@obi-wallet/sdk";
import { action, makeObservable, observable } from "mobx";

import { Language } from "../languages";

export enum Brand {
  Obi = "Obi",
  Loop = "Loop",
}

export enum Feature {
  AccountsTab = "AccountsTab",
  HealthChecks = "HealthChecks",
  NftTab = "NftTab",
  Recovery = "Recovery",
  Staking = "Staking",
  BrandToggle = "BrandToggle",
  DemoMode = "DemoMode",
}

export interface Config {
  brand: Brand;
  chains: {
    enabled: ChainId[];
    default: ChainId;
  };
  languages: {
    enabled: Language[];
    default: Language;
  };
  features: Record<Feature, boolean>;
  requiredKeys: KeyType[];
}

export class ConfigStore {
  @observable
  public config: Config;

  constructor({ initialConfig }: { initialConfig: Config }) {
    this.config = initialConfig;
    makeObservable(this);
  }

  @action
  public setConfig(config: Config) {
    this.config = config;
  }

  public isFeatureEnabled(feature: Feature): boolean {
    return this.config.features[feature];
  }

  public get brand(): Brand {
    return this.config.brand;
  }

  @action
  public toggleBrand() {
    this.config.brand =
      this.config.brand === Brand.Obi ? Brand.Loop : Brand.Obi;
  }

  @action
  public setBrand(brand: Brand) {
    this.config.brand = brand;
  }

  public isObi(): boolean {
    return this.config.brand === Brand.Obi;
  }

  public isLoop(): boolean {
    return this.config.brand === Brand.Loop;
  }
}
