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
    makeObservable<ChainStore, "configStore" | "walletsStore" | "currentChain">(
      this,
      {
        configStore: false,
        walletsStore: false,
        currentChain: false,
        setCurrentChain: action,
        currentChainInformation: computed,
      },
    );

    autorun(() => {
      this.setCurrentChain(configStore.config.chains.default);
    });
  }

  public get currentChain() {
    return (
      this.walletsStore.currentChainId ?? this.configStore.config.chains.default
    );
  }

  public setCurrentChain(chain: ChainId) {
    this.walletsStore.setCurrentChain(chain);
  }

  public get currentChainInformation() {
    return Chain.information(this.currentChain);
  }
}
