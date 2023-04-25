import {
  ChainId,
  cosmosChains,
  isCosmosChain,
  terraChains,
} from "@obi-wallet/sdk";
import { action, computed, makeObservable, observable } from "mobx";

import { ConfigStore } from "./config";

export class ChainStore {
  protected readonly configStore: ConfigStore;

  @observable
  public currentChain: ChainId;

  constructor({ configStore }: { configStore: ConfigStore }) {
    this.configStore = configStore;
    this.currentChain = configStore.config.chains.default;
    makeObservable(this);
  }

  @action
  public setCurrentChain(chain: ChainId) {
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
