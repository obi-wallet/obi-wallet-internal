import { ChainStore } from "../chain";
import { ConfigStore } from "../config";
import { WalletsStore, WalletType } from "../wallets";
import { CosmosBalancesStore } from "./cosmos";
import { TerraBalancesStore } from "./terra";

export * from "./abstract-balances-store";

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

  public get delegations() {
    return this.store.getDelegations();
  }

  public async fetchDelegations() {
    await this.store.fetchDelegations();
  }

  public get unbondingDelegations() {
    return this.store.getUnbondingDelegations();
  }

  public async fetchUnbondingDelegations() {
    await this.store.fetchUnbondingDelegations();
  }

  public get validators() {
    return this.store.getValidators();
  }

  public async fetchValidators() {
    await this.store.fetchValidators();
  }

  public get rewards() {
    return this.store.getRewards();
  }

  public async fetchRewards() {
    await this.store.fetchRewards();
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
