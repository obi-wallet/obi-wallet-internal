import { computed, makeObservable, observable } from "mobx";

import { Chain, chains, TerraChain, terraChains } from "../chains";
import { ConfigStore } from "./config";

export class ChainStore {
  @observable
  public currentChain: Chain;

  @observable
  public currentTerraChain: TerraChain;

  constructor({ configStore }: { configStore: ConfigStore }) {
    this.currentChain = configStore.config.chains.default;
    this.currentTerraChain = configStore.config.terraChains.default;
    makeObservable(this);
  }

  @computed
  public get currentChainInformation() {
    return chains[this.currentChain];
  }

  @computed
  public get currentTerraChainInformation() {
    return terraChains[this.currentTerraChain];
  }
}
