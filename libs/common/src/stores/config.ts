import { action, makeObservable, observable } from "mobx";

import { CosmosChain, TerraChain } from "../chains";
import { Language } from "../languages";
import { WalletType } from "./wallets";

export enum Brand {
  Obi = "Obi",
  Loop = "Loop",
}

export type MultisigWalletType =
  | WalletType.CosmosMultisig
  | WalletType.TerraMultisig;

export enum Feature {
  AccountsTab = "AccountsTab",
  HealthChecks = "HealthChecks",
  NftTab = "NftTab",
  Recovery = "Recovery",
  SinglesigWallets = "SinglesigWallets",
  Staking = "Staking",
  InAppPurchases = "InAppPurchases",
  BrandToggle = "BrandToggle",
}

export interface Config {
  brand: Brand;
  defaultMultisigWalletType: MultisigWalletType;
  cosmosChains: {
    enabled: CosmosChain[];
    default: CosmosChain;
  };
  terraChains: {
    enabled: TerraChain[];
    default: TerraChain;
  };
  languages: {
    enabled: Language[];
    default: Language;
  };
  features: Record<Feature, boolean>;
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
    if (this.isFeatureEnabled(Feature.BrandToggle)) {
      this.config.brand =
        this.config.brand === Brand.Obi ? Brand.Loop : Brand.Obi;
    }
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

  public getDefaultMultisigWalletType() {
    return this.config.defaultMultisigWalletType;
  }
}
