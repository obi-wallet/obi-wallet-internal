import { computed, makeObservable, observable } from "mobx";

import { Chain, chains, TerraChain, terraChains } from "../chains";
import { ConfigStore } from "./config";
import { WalletType } from "./wallets";

export class ChainStore {
  protected readonly configStore: ConfigStore;

  @observable
  public currentChain: Chain;

  @observable
  public currentTerraChain: TerraChain;

  constructor({ configStore }: { configStore: ConfigStore }) {
    this.configStore = configStore;
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

  @computed
  public get currentChainId() {
    switch (this.configStore.getDefaultMultisigWalletType()) {
      case WalletType.Multisig:
        return this.currentChain;
      case WalletType.TerraMultisig:
        return this.currentTerraChain;
    }
  }
}
