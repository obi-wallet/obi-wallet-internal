import { Validator as RawValidator } from "@terra-money/terra.js";
import {
  Pagination,
  PaginationOptions,
} from "@terra-money/terra.js/dist/client/lcd/APIRequester";
import { BondStatus } from "@terra-money/terra.proto/cosmos/staking/v1beta1/staking";
import { bondStatusFromJSON } from "@terra-money/terra.proto/cosmos/staking/v1beta1/staking";
import BigNumber from "bignumber.js";
import { makeObservable, observable, runInAction } from "mobx";
import * as R from "ramda";

import { TerraChain } from "../../chains";
import { createLcdClient } from "../../clients";
import { ChainStore } from "../chain";
import { WalletsStore } from "../wallets";
import {
  AbstractBalancesStore,
  Coin,
  Delegation,
  ExtendedCoin,
  ExtendedValidator,
  UnbondingDelegation,
} from "./abstract-balances-store";

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
  public rewardsPerChain: Partial<Record<TerraChain, Coin[]>> = {};

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

    const rawValidators = await fetchAll((paginationOptions) => {
      return client.staking.validators(paginationOptions);
    });

    const MAX_COMMISSION = 0.05;
    const VOTE_POWER_INCLUDE = 0.65;

    const totalStaked = BigNumber.sum(
      ...rawValidators.map(({ tokens = 0 }) => Number(tokens))
    ).toNumber();
    const getVotePower = (v: RawValidator) => Number(v.tokens) / totalStaked;

    const prioritizedValidators = rawValidators
      .sort((a, b) => getVotePower(a) - getVotePower(b)) // least to greatest
      .reduce(
        (acc, cur) => {
          acc.sumVotePower += getVotePower(cur);
          if (acc.sumVotePower < VOTE_POWER_INCLUDE) {
            acc.eligible.push(cur);
          }
          return acc;
        },
        {
          sumVotePower: 0,
          eligible: [] as RawValidator[],
        }
      )
      .eligible.filter(
        ({ commission, status }) =>
          bondStatusFromJSON(BondStatus[status]) ===
            BondStatus.BOND_STATUS_BONDED &&
          Number(commission.commission_rates.rate) <= MAX_COMMISSION
      )
      .map(({ operator_address }) => operator_address);

    const validators = rawValidators
      .map((validator): ExtendedValidator => {
        const promoted =
          validator.operator_address ===
          this.chainStore.currentTerraChainInformation.obiValidator;
        const rank =
          (promoted ? 2 : 0) +
          (prioritizedValidators.includes(validator.operator_address) ? 1 : 0) +
          Math.random();

        return {
          icon: validator.description.identity
            ? `https://raw.githubusercontent.com/terra-money/validator-images/main/images/${validator.description.identity}.jpg`
            : null,
          label: validator.description.moniker,
          address: validator.operator_address,
          votingPower: ((Number(validator.tokens) / totalStaked) * 100).toFixed(
            2
          ),
          commission: validator.commission.commission_rates.rate
            .times(100)
            .toFixed(2),
          promoted,
          active:
            bondStatusFromJSON(BondStatus[validator.status]) ===
            BondStatus.BOND_STATUS_BONDED,
          jailed: validator.jailed,
          rank,
        };
      })
      .sort((a, b) => b.rank - a.rank);

    runInAction(() => {
      this.validatorsPerChain[this.chainStore.currentTerraChain] = validators;
    });
  }

  public getRewards(): Coin[] {
    return this.rewardsPerChain[this.chainStore.currentTerraChain] ?? [];
  }

  public async fetchRewards(): Promise<void> {
    const { address } = this.walletsStore;
    if (!address) return;

    const client = await createLcdClient(this.chainStore.currentTerraChain);

    const rewards = await client.distribution.rewards(address);
    runInAction(() => {
      this.rewardsPerChain[this.chainStore.currentTerraChain] =
        rewards.total.map((coin) => {
          return {
            denom: coin.denom,
            amount: coin.amount.toString(),
          };
        });
    });
  }
}

async function fetchAll<T>(
  f: (
    paginationOptions: Partial<PaginationOptions>
  ) => Promise<[T[], Pagination]>
): Promise<T[]> {
  const result: T[] = [];
  let key: string | null = "";

  do {
    const [list, pagination] = (await f({
      "pagination.limit": "100",
      "pagination.key": key,
    })) as [T[], Pagination];

    result.push(...list);
    key = pagination?.next_key;
  } while (key);

  return result;
}
