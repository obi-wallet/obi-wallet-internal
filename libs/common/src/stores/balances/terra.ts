import { Coins, Validator as RawValidator } from "@terra-money/terra.js";
import {
  Pagination,
  PaginationOptions,
} from "@terra-money/terra.js/dist/client/lcd/APIRequester";
import {
  BondStatus,
  bondStatusFromJSON,
} from "@terra-money/terra.proto/cosmos/staking/v1beta1/staking";
import BigNumber from "bignumber.js";
import { makeObservable, observable, runInAction } from "mobx";
import * as R from "ramda";
import invariant from "tiny-invariant";

import { TerraChain } from "../../chains";
import { createLcdClient } from "../../clients";
import { terra } from "../../networks/terra";
import { ChainStore } from "../chain";
import { WalletsStore } from "../wallets";
import {
  AbstractBalancesStore,
  Delegation,
  ExtendedCoin,
  ExtendedValidator,
  Rewards,
  UnbondingDelegation,
} from "./abstract-balances-store";

export async function fetchPrices({ chainId }: { chainId: TerraChain }) {
  const client = createLcdClient(chainId);
  const stack: { denom: string; usdPrice: BigNumber }[] = [
    {
      // axlUSDC
      denom:
        "ibc/B3504E092456BA618CC28AC671A71FB08C6CA0FD0BE7C8A5B5A3E2DD933CC9E4",
      usdPrice: new BigNumber(1),
    },
    {
      // axlUSDT
      denom:
        "ibc/CBF67A2BCF6CAE343FDF251E510C8E18C361FC02B23430C121116E0811835DEF",
      usdPrice: new BigNumber(1),
    },
  ];

  const prices: Record<string, BigNumber> = {};

  type Asset =
    | { token: { contract_addr: string } }
    | { native_token: { denom: string } };

  function toDenom(asset: Asset) {
    return "token" in asset
      ? asset.token.contract_addr
      : asset.native_token.denom;
  }

  const allPairs = R.values(terra.tokenPairs) as {
    asset_infos: Asset[];
    contract_addr: string;
    dex: "astroport" | "terraswap" | "phoenix";
  }[];

  while (stack.length > 0) {
    const item = stack.pop();
    if (!item) break;
    if (R.has(item.denom, prices)) continue;

    // @ts-expect-error Not sure why TS doesn't like it
    prices[item.denom] = item.usdPrice;

    const relevantPairs = allPairs
      .filter((pair) => {
        return pair.asset_infos.find((asset) => {
          return toDenom(asset) === item.denom;
        });
      })
      .map((pair) => {
        const otherAsset = pair.asset_infos.find((asset) => {
          return toDenom(asset) !== item.denom;
        });

        invariant(otherAsset, "otherAsset should exist");

        return {
          denom: toDenom(otherAsset),
          pair,
        };
      });

    for (const { denom, pair } of relevantPairs) {
      if (R.has(denom, prices) || stack.find((item) => item.denom === denom))
        continue;
      const price = await (async () => {
        try {
          switch (pair.dex) {
            case "astroport":
            case "terraswap":
            case "phoenix": {
              const response = (await client.wasm.contractQuery(
                pair.contract_addr,
                {
                  pool: {},
                }
              )) as { assets: { info: Asset; amount: string }[] };

              const thisAsset = response.assets.find((asset) => {
                return toDenom(asset.info) === item.denom;
              });
              const otherAsset = response.assets.find((asset) => {
                return toDenom(asset.info) !== item.denom;
              });

              invariant(thisAsset, "thisAsset should exist");
              invariant(otherAsset, "otherAsset should exist");

              return item.usdPrice.times(
                new BigNumber(thisAsset.amount).div(otherAsset.amount)
              );
            }
          }
        } catch (e) {
          console.log(e);
        }

        return null;
      })();

      if (price && !price.isNaN()) {
        stack.push({ denom, usdPrice: price });
      }
    }
  }

  return R.mapObjIndexed((price) => {
    return price.toNumber();
  }, prices);
}

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
  public rewardsPerChain: Partial<Record<TerraChain, Rewards>> = {};

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
    const [[coins], prices] = await Promise.all([
      client.bank.balance(address),
      fetchPrices({ chainId: this.chainStore.currentTerraChain }),
    ]);
    const balances = coins.map((coin): ExtendedCoin => {
      return {
        denom: coin.denom,
        amount: coin.amount.toString(),
        usdPrice: prices[coin.denom] ?? 0,
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
                  amount: entry.balance.toString(),
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

  public getRewards(): Rewards {
    return (
      this.rewardsPerChain[this.chainStore.currentTerraChain] ?? {
        perDelegator: [],
        total: {
          denom: this.chainStore.currentTerraChainInformation.denom,
          amount: "0",
        },
      }
    );
  }

  public async fetchRewards(): Promise<void> {
    const { address } = this.walletsStore;
    if (!address) return;

    const client = await createLcdClient(this.chainStore.currentTerraChain);

    const rewards = await client.distribution.rewards(address);

    const handleRewards = (coins: Coins) => {
      const mapped = coins.map((coin) => {
        return {
          denom: coin.denom,
          amount: coin.amount.toString(),
        };
      });
      return mapped.length > 0
        ? mapped[0]
        : {
            denom: this.chainStore.currentTerraChainInformation.denom,
            amount: "0",
          };
    };

    const perDelegator = R.values(
      R.mapObjIndexed((rewards, address) => {
        return {
          address,
          rewards: handleRewards(rewards),
        };
      }, rewards.rewards)
    );
    const total = handleRewards(rewards.total);

    runInAction(() => {
      this.rewardsPerChain[this.chainStore.currentTerraChain] = {
        perDelegator,
        total,
      };
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
