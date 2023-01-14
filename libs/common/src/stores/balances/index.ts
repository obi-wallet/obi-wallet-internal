import { ChainStore } from "../chain";
import { ConfigStore } from "../config";
import { WalletsStore, WalletType } from "../wallets";
import { CosmosBalancesStore } from "./cosmos";
import { TerraBalancesStore } from "./terra";

export class BalancesStore {
  protected readonly configStore: ConfigStore;
  protected readonly cosmosBalancesStore: CosmosBalancesStore;
  protected readonly terraBalancesStore: TerraBalancesStore;

  constructor({
    configStore,
    chainStore,
    walletsStore,
  }: {
    configStore: ConfigStore;
    chainStore: ChainStore;
    walletsStore: WalletsStore;
  }) {
    this.configStore = configStore;
    this.cosmosBalancesStore = new CosmosBalancesStore({
      chainStore,
      walletsStore,
    });
    this.terraBalancesStore = new TerraBalancesStore({
      chainStore,
      walletsStore,
    });
  }

  public get balances() {
    return this.store.getBalances();
  }

  public async fetchBalances() {
    await this.store.fetchBalances();
  }

  protected get store() {
    switch (this.configStore.getDefaultMultisigWalletType()) {
      case WalletType.CosmosMultisig:
        return this.cosmosBalancesStore;
      case WalletType.TerraMultisig:
        return this.terraBalancesStore;
    }
  }
}
