import { Coins, Validator as RawValidator } from "@terra-money/feather.js";
import {
  BondStatus,
  bondStatusFromJSON,
} from "@terra-money/terra.proto/cosmos/staking/v1beta1/staking";
import BigNumber from "bignumber.js";
import * as R from "ramda";

import { TerraChainId, terraChains } from "../../../chains";
import { FeatherJsClient } from "../../../clients";
import {
  Delegation,
  EnrichedValidator,
  Rewards,
  UnbondingDelegation,
} from "../../common";
import { AbstractStakingSdk } from "../abstract";

export class FeatherJsStakingSdk extends AbstractStakingSdk {
  protected override chainId: TerraChainId;
  protected client: FeatherJsClient;

  public constructor({
    chainId,
    client,
  }: {
    chainId: TerraChainId;
    client: FeatherJsClient;
  }) {
    super(chainId);
    this.chainId = chainId;
    this.client = client;
  }

  protected async validatorsQueryFn(): Promise<EnrichedValidator[]> {
    return await this.client.withClient(async (client) => {
      const rawValidators = await this.client.fetchAllPages(
        (paginationOptions) => {
          return client.staking.validators(this.chainId, paginationOptions);
        }
      );

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
        .map((validator): EnrichedValidator => {
          const promoted =
            validator.operator_address === this.chain.obiValidator;
          const rank =
            (promoted ? 2 : 0) +
            (prioritizedValidators.includes(validator.operator_address)
              ? 1
              : 0) +
            Math.random();

          return {
            icon: validator.description.identity
              ? `https://raw.githubusercontent.com/terra-money/validator-images/main/images/${validator.description.identity}.jpg`
              : null,
            label: validator.description.moniker,
            address: validator.operator_address,
            votingPower: (
              (Number(validator.tokens) / totalStaked) *
              100
            ).toFixed(2),
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

  protected async delegationsQueryFn(address: string): Promise<Delegation[]> {
    return await this.client.withClient(async (client) => {
      const rawDelegations = await this.client.fetchAllPages(
        (paginationOptions) => {
          return client.staking.delegations(
            address,
            undefined,
            paginationOptions
          );
        }
      );
      return await Promise.all(
        rawDelegations.map(async (delegation): Promise<Delegation> => {
          const validator = await client.staking.validator(
            delegation.validator_address
          );
          return {
            balance: {
              id: delegation.balance.denom,
              rawAmount: delegation.balance.amount.toString(),
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

  protected async unbondingDelegationsQueryFn(
    address: string
  ): Promise<UnbondingDelegation[]> {
    return await this.client.withClient(async (client) => {
      const rawUnbondingDelegations = await this.client.fetchAllPages(
        (paginationOptions) => {
          return client.staking.unbondingDelegations(
            address,
            undefined,
            paginationOptions
          );
        }
      );
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
                    id: this.chain.denom,
                    rawAmount: entry.balance.toString(),
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

  protected async rewardsQueryFn(address: string): Promise<Rewards> {
    return await this.client.withClient(async (client) => {
      const rewards = await client.distribution.rewards(address);

      const handleRewards = (coins: Coins) => {
        const mapped = coins.map((coin) => {
          return {
            id: coin.denom,
            rawAmount: coin.amount.toString(),
          };
        });
        return mapped.length > 0
          ? mapped[0]
          : {
              id: this.chain.denom,
              rawAmount: "0",
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

  protected get chain() {
    return terraChains[this.chainId];
  }
}
