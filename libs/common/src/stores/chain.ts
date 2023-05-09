import { Chain, ChainId, Wallets } from "@obi-wallet/sdk";
import { action, autorun, computed, makeObservable } from "mobx";

import { ConfigStore } from "./config";

export class ChainStore {
  protected readonly configStore: ConfigStore;
  protected readonly walletsStore: Wallets;

  constructor({
    configStore,
    walletsStore,
  }: {
    configStore: ConfigStore;
    walletsStore: Wallets;
  }) {
    this.configStore = configStore;
    this.walletsStore = walletsStore;
    makeObservable(this);

    autorun(() => {
      this.setCurrentChain(configStore.config.chains.default);
    });
  }

  public get currentChain() {
    return (
      this.walletsStore.currentChainId ?? this.configStore.config.chains.default
    );
  }

  @action
  public setCurrentChain(chain: ChainId) {
    this.walletsStore.setCurrentChain(chain);
  }

  @computed
  public get currentChainInformation() {
    return Chain.information(this.currentChain);
  }
}
