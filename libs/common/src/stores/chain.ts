import { computed, makeObservable, observable } from "mobx";

import { Chain, chains } from "../chains";
import { ConfigStore } from "./config";

export class ChainStore {
  @observable
  public currentChain: Chain;

  constructor({ configStore }: { configStore: ConfigStore }) {
    this.currentChain = configStore.config.chains.default;
    makeObservable(this);
  }

  @computed
  public get currentChainInformation() {
    return chains[this.currentChain];
  }
}
