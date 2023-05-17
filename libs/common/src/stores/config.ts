import { Brand, Config, Feature } from "@obi-wallet/config";
import { action, makeObservable, observable } from "mobx";

export class ConfigStore {
  public config: Config;

  constructor({ initialConfig }: { initialConfig: Config }) {
    this.config = initialConfig;
    makeObservable(this, {
      isFeatureEnabled: false,
      brand: false,
      isObi: false,
      isLoop: false,
      config: observable,
      setConfig: action,
      toggleBrand: action,
      setBrand: action,
    });
  }

  public setConfig(config: Config) {
    this.config = config;
  }

  public isFeatureEnabled(feature: Feature): boolean {
    return this.config.features[feature];
  }

  public get brand(): Brand {
    return this.config.brand;
  }

  public toggleBrand() {
    this.config.brand =
      this.config.brand === Brand.Obi ? Brand.Loop : Brand.Obi;
  }

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
