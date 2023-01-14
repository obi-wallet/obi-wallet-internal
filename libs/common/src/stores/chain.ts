import { action, computed, makeObservable, observable } from "mobx";

import {
  CosmosChain,
  cosmosChains,
  isCosmosChain,
  isTerraChain,
  TerraChain,
  terraChains,
} from "../chains";
import { ConfigStore } from "./config";
import { WalletType } from "./wallets";

export class ChainStore {
  protected readonly configStore: ConfigStore;

  @observable
  public currentCosmosChain: CosmosChain;

  @observable
  public currentTerraChain: TerraChain;

  constructor({ configStore }: { configStore: ConfigStore }) {
    this.configStore = configStore;
    this.currentCosmosChain = configStore.config.cosmosChains.default;
    this.currentTerraChain = configStore.config.terraChains.default;
    makeObservable(this);
  }

  @computed
  public get currentCosmosChainInformation() {
    return cosmosChains[this.currentCosmosChain];
  }

  @computed
  public get currentTerraChainInformation() {
    return terraChains[this.currentTerraChain];
  }

  @computed
  public get currentChain() {
    switch (this.configStore.getDefaultMultisigWalletType()) {
      case WalletType.CosmosMultisig:
        return this.currentCosmosChain;
      case WalletType.TerraMultisig:
        return this.currentTerraChain;
    }
  }

  @action
  public setCurrentChain(chain: CosmosChain | TerraChain) {
    if (isCosmosChain(chain)) {
      this.currentCosmosChain = chain;
    }

    if (isTerraChain(chain)) {
      this.currentTerraChain = chain;
    }
  }

  @computed
  public get currentChainInformation() {
    switch (this.configStore.getDefaultMultisigWalletType()) {
      case WalletType.CosmosMultisig:
        return this.currentCosmosChainInformation;
      case WalletType.TerraMultisig:
        return this.currentTerraChainInformation;
    }
  }
}
