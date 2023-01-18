import { Convert } from "@terra-money/terra.js/dist/util/convert";
import { makeObservable, observable, runInAction } from "mobx";
import * as R from "ramda";

import { TerraChain } from "../../chains";
import { createLcdClient } from "../../clients";
import { ChainStore } from "../chain";
import { WalletsStore } from "../wallets";
import {
  AbstractBalancesStore,
  Delegation,
  ExtendedCoin,
  ExtendedValidator,
  UnbondingDelegation,
  Validator,
} from "./abstract-balances-store";

import toFixed = Convert.toFixed;

export class TerraBalancesStore extends AbstractBalancesStore {
  protected readonly chainStore: ChainStore;
  protected readonly walletsStore: WalletsStore;

  @observable
  public balancesPerChain: Partial<Record<TerraChain, ExtendedCoin[]>> = {};
  public delegationsPerChain: Partial<Record<TerraChain, Delegation[]>> = {};
  public unbondingDelegationsPerChain: Partial<
    Record<TerraChain, UnbondingDelegation[]>
  > = {};
  public validatorsPerChain: Partial<Record<TerraChain, ExtendedValidator[]>> =
    {};

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

  public getBalances(): ExtendedCoin[] {
    return this.balancesPerChain[this.chainStore.currentTerraChain] ?? [];
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

  public getDelegations(): Delegation[] {
    return this.delegationsPerChain[this.chainStore.currentTerraChain] ?? [];
  }

  public async fetchDelegations(): Promise<void> {
    const { address } = this.walletsStore;
    if (!address) return;

    const client = await createLcdClient(this.chainStore.currentTerraChain);

    // TODO: handle pagination
    const [rawDelegations] = await client.staking.delegations(address);
    const delegations = await Promise.all(
      rawDelegations.map(async (delegation): Promise<Delegation> => {
        const validator = await client.staking.validator(
          delegation.validator_address
        );
        console.log(validator);

        return {
          balance: {
            denom: delegation.balance.denom,
            amount: delegation.balance.amount.toString(),
          },
          validator: {
            icon: `https://github.com/terra-money/validator-images/blob/main/images/${validator.description.identity}.jpg`,
            label: validator.description.moniker,
            address: delegation.validator_address,
          },
        };
      })
    );

    runInAction(() => {
      this.delegationsPerChain[this.chainStore.currentTerraChain] = delegations;
    });
  }

  public getUnbondingDelegations(): UnbondingDelegation[] {
    return (
      this.unbondingDelegationsPerChain[this.chainStore.currentTerraChain] ?? []
    );
  }

  public async fetchUnbondingDelegations(): Promise<void> {
    const { address } = this.walletsStore;
    if (!address) return;

    const client = await createLcdClient(this.chainStore.currentTerraChain);

    // TODO: handle pagination
    const [rawUnbondingDelegations] = await client.staking.unbondingDelegations(
      address
    );
    const unbondingDelegations = R.flatten(
      await Promise.all(
        rawUnbondingDelegations.map(
          async (unbondingDelegation): Promise<UnbondingDelegation[]> => {
            const validator = await client.staking.validator(
              unbondingDelegation.validator_address
            );

            return unbondingDelegation.entries.map((entry) => {
              return {
                balance: {
                  denom: this.chainStore.currentTerraChainInformation.denom,
                  amount: entry.initial_balance.minus(entry.balance).toString(),
                },
                validator: {
                  icon: `https://github.com/terra-money/validator-images/blob/main/images/${validator.description.identity}.jpg`,
                  label: validator.description.moniker,
                  address: unbondingDelegation.validator_address,
                },
                completionTime: entry.completion_time,
              };
            });
          }
        )
      )
    );

    runInAction(() => {
      this.unbondingDelegationsPerChain[this.chainStore.currentTerraChain] =
        unbondingDelegations;
    });
  }

  public getValidators(): ExtendedValidator[] {
    return this.validatorsPerChain[this.chainStore.currentTerraChain] ?? [];
  }

  public async fetchValidators(): Promise<void> {
    const client = await createLcdClient(this.chainStore.currentTerraChain);

    const [rawValidators] = await client.staking.validators();
    const validators = await Promise.all(
      rawValidators.map(async (validator): Promise<ExtendedValidator> => {
        return {
          icon: validator.description.identity
            ? `https://raw.githubusercontent.com/terra-money/validator-images/main/images/${validator.description.identity}.jpg`
            : null,
          label: validator.description.moniker,
          address: validator.operator_address,
          commission: validator.commission.commission_rates.rate
            .times(100)
            .toFixed(0),
        };
      })
    );

    runInAction(() => {
      this.validatorsPerChain[this.chainStore.currentTerraChain] = validators;
    });
  }
}
