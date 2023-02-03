import { action, computed, makeObservable, observable } from "mobx";

import { ConfigStore } from "./config";
import { Chain, cosmosChains, isCosmosChain, terraChains } from "../chains";

export class ChainStore {
  protected readonly configStore: ConfigStore;

  @observable
  public currentChain: Chain;

  constructor({ configStore }: { configStore: ConfigStore }) {
    this.configStore = configStore;
    this.currentChain = configStore.config.chains.default;
    makeObservable(this);
  }

  @action
  public setCurrentChain(chain: Chain) {
    this.currentChain = chain;
  }

  @computed
  public get currentChainInformation() {
    if (isCosmosChain(this.currentChain)) {
      return cosmosChains[this.currentChain];
    } else {
      return terraChains[this.currentChain];
    }
  }
}
