import { makeObservable, observable, runInAction } from "mobx";

import { TerraChain } from "../../chains";
import { createLcdClient } from "../../clients";
import { ChainStore } from "../chain";
import { WalletsStore } from "../wallets";
import { AbstractBalancesStore, ExtendedCoin } from "./abstract-balances-store";

export class TerraBalancesStore extends AbstractBalancesStore {
  protected readonly chainStore: ChainStore;
  protected readonly walletsStore: WalletsStore;

  @observable
  public balancesPerChain: Partial<Record<TerraChain, ExtendedCoin[]>> = {};

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
    makeObservable(this);
  }

  public async fetchBalances(): Promise<void> {
    const { address } = this.walletsStore;
    if (!address) return;

    const client = await createLcdClient(this.chainStore.currentTerraChain);

    // TODO: handle pagination
    const [coins] = await client.bank.balance(address);
    const balances = coins.map((coin): ExtendedCoin => {
      return {
        denom: coin.denom,
        amount: coin.amount.toString(),
        usdPrice: 0,
      };
    });

    runInAction(() => {
      this.balancesPerChain[this.chainStore.currentTerraChain] = balances;
    });
  }

  public getBalances(): ExtendedCoin[] {
    return this.balancesPerChain[this.chainStore.currentTerraChain] ?? [];
  }
}
