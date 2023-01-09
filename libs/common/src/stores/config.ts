import { action, makeObservable, observable } from "mobx";

import { Chain, TerraChain } from "../chains";
import { Language } from "../languages";
import { WalletType } from "./wallets";

export enum Brand {
  Obi = "Obi",
  Loop = "Loop",
}

export type MultisigWalletType = WalletType.Multisig | WalletType.TerraMultisig;

export enum Feature {
  AccountsTab = "AccountsTab",
  HealthChecks = "HealthChecks",
  NftTab = "NftTab",
}

export interface Config {
  brand: Brand;
  defaultMultisigWalletType: MultisigWalletType;
  chains: {
    enabled: Chain[];
    default: Chain;
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
    makeObservable(this);
    this.config = initialConfig;
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
