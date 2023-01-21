import { ChainStore } from "../chain";
import { WalletsStore } from "../wallets";
import {
  AbstractBalancesStore,
  Delegation,
  ExtendedValidator,
  Rewards,
  UnbondingDelegation,
} from "./abstract-balances-store";

export class CosmosBalancesStore extends AbstractBalancesStore {
  protected readonly chainStore: ChainStore;
  protected readonly walletsStore: WalletsStore;

  constructor({
    chainStore,
    walletsStore,
  }: {
    chainStore: ChainStore;
    walletsStore: WalletsStore;
  }) {
    super();
    this.chainStore = chainStore;
    this.walletsStore = walletsStore;
  }

  public getDelegations(): Delegation[] {
    return [];
  }

  public async fetchDelegations(): Promise<void> {
    // TODO: not implemented yet
  }

  public getUnbondingDelegations(): UnbondingDelegation[] {
    return [];
  }

  public async fetchUnbondingDelegations(): Promise<void> {
    // TODO: not implemented yet
  }

  public getValidators(): ExtendedValidator[] {
    return [];
  }

  public async fetchValidators(): Promise<void> {
    // TODO: not implemented yet
  }

  public getRewards(): Rewards {
    return {
      perDelegator: [],
      total: {
        denom: this.chainStore.currentCosmosChainInformation.denom,
        amount: "0",
      },
    };
  }

  public async fetchRewards(): Promise<void> {
    // TODO: not implemented yet
  }
}
