import { Chain } from "@obi-wallet/sdk";
import { computed } from "mobx";

import { ConfigStore } from "./config";

export class ChainStore {
  protected readonly configStore: ConfigStore;

  constructor({ configStore }: { configStore: ConfigStore }) {
    this.configStore = configStore;
  }

  public get currentChain() {
    return this.configStore.config.chains.default;
  }

  @computed
  public get currentChainInformation() {
    return Chain.information(this.currentChain);
  }
}
