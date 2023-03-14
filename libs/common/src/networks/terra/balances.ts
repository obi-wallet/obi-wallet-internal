import { TerraChain, terraChains, withTerraClient } from "@obi-wallet/sdk";
import { Coins, Validator as RawValidator } from "@terra-money/feather.js";
import {
  Pagination,
  PaginationOptions,
} from "@terra-money/feather.js/dist/client/lcd/APIRequester";
import {
  BondStatus,
  bondStatusFromJSON,
} from "@terra-money/terra.proto/cosmos/staking/v1beta1/staking";
import BigNumber from "bignumber.js";
import * as R from "ramda";

import {
  Delegation,
  ExtendedValidator,
  Rewards,
  UnbondingDelegation,
} from "../common/types";

export async function fetchDelegations({
  address,
  chainId,
}: {
  address: string;
  chainId: TerraChain;
}): Promise<Delegation[]> {
  return await withTerraClient(chainId, async (client) => {
    const rawDelegations = await fetchAll((paginationOptions) => {
      return client.staking.delegations(address, undefined, paginationOptions);
    });
    return await Promise.all(
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
  });
}

export async function fetchUnbondingDelegations({
  address,
  chainId,
}: {
  address: string;
  chainId: TerraChain;
}): Promise<UnbondingDelegation[]> {
  return await withTerraClient(chainId, async (client) => {
    const rawUnbondingDelegations = await fetchAll((paginationOptions) => {
      return client.staking.unbondingDelegations(
        address,
        undefined,
        paginationOptions
      );
    });
    return R.flatten(
      await Promise.all(
        rawUnbondingDelegations.map(
          async (unbondingDelegation): Promise<UnbondingDelegation[]> => {
            const validator = await client.staking.validator(
              unbondingDelegation.validator_address
            );

            return unbondingDelegation.entries.map((entry) => {
              return {
                balance: {
                  denom: terraChains[chainId].denom,
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
  });
}

export async function fetchValidators({
  chainId,
}: {
  chainId: TerraChain;
}): Promise<ExtendedValidator[]> {
  return await withTerraClient(chainId, async (client) => {
    const rawValidators = await fetchAll((paginationOptions) => {
      return client.staking.validators(chainId, paginationOptions);
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

    return rawValidators
      .map((validator): ExtendedValidator => {
        const promoted =
          validator.operator_address === terraChains[chainId].obiValidator;
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
  });
}

export async function fetchRewards({
  address,
  chainId,
}: {
  address: string;
  chainId: TerraChain;
}): Promise<Rewards> {
  return await withTerraClient(chainId, async (client) => {
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
            denom: terraChains[chainId].denom,
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

    return {
      perDelegator,
      total,
    };
  });
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
