import {
  Coins,
  LCDClient,
  Validator as RawValidator,
} from "@terra-money/feather.js";
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
import invariant from "tiny-invariant";

import { tokenPairs } from "./token-pairs";
import { TerraChain, terraChains } from "../../chains";
import { withTerraClient } from "../../clients";
import { AbstractSdk } from "../abstract";
import {
  Coin,
  Delegation,
  EnrichedValidator,
  UnbondingDelegation,
} from "../common";

export class TerraSdk extends AbstractSdk {
  protected constructor(protected chainId: TerraChain) {
    super(chainId);
  }

  public get chain() {
    return terraChains[this.chainId];
  }

  public async fetchPrices() {
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

    const allPairs = R.values(tokenPairs) as {
      asset_infos: Asset[];
      contract_addr: string;
      dex: "astroport" | "terraswap" | "phoenix";
    }[];
    const contractInfos = await Promise.all(
      allPairs.map(async (pair) => {
        switch (pair.dex) {
          case "astroport":
          case "terraswap":
          case "phoenix": {
            const response = await this.withClient(async (client) => {
              return (await client.wasm.contractQuery(pair.contract_addr, {
                pool: {},
              })) as {
                assets: { info: Asset; amount: string }[];
              };
            });
            return {
              ...pair,
              ...response,
            };
          }
        }
      })
    );

    while (stack.length > 0) {
      const item = stack.pop();
      if (!item) break;
      if (prices[item.denom]) continue;

      prices[item.denom] = item.usdPrice;

      const relevantPairs = contractInfos
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
        if (
          R.has(denom, prices) ||
          stack.find((item) => item.denom === denom)
        ) {
          continue;
        }

        const thisAsset = pair.assets.find((asset) => {
          return toDenom(asset.info) === item.denom;
        });
        const otherAsset = pair.assets.find((asset) => {
          return toDenom(asset.info) !== item.denom;
        });

        invariant(thisAsset, "thisAsset should exist");
        invariant(otherAsset, "otherAsset should exist");

        const price = item.usdPrice.times(
          new BigNumber(thisAsset.amount).div(otherAsset.amount)
        );

        if (price && !price.isNaN()) {
          stack.push({ denom, usdPrice: price });
        }
      }
    }

    return R.mapObjIndexed((price) => {
      return price.toNumber();
    }, prices);
  }

  public async fetchBalances({ address }: { address: string }) {
    return await this.withClient(async (client) => {
      return await this.fetchAllPages(async (paginationOptions) => {
        const [coins, pagination] = await client.bank.balance(
          address,
          paginationOptions
        );
        return [
          coins.map((coin): Coin => {
            return {
              denom: coin.denom,
              amount: coin.amount.toString(),
            };
          }),
          pagination,
        ];
      });
    });
  }

  public async fetchAllPages<T>(
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

  public async fetchDelegations({ address }: { address: string }) {
    return await this.withClient(async (client) => {
      const rawDelegations = await this.fetchAllPages((paginationOptions) => {
        return client.staking.delegations(
          address,
          undefined,
          paginationOptions
        );
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

  public async fetchUnbondingDelegations({ address }: { address: string }) {
    return await this.withClient(async (client) => {
      const rawUnbondingDelegations = await this.fetchAllPages(
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
                    denom: this.chain.denom,
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

  public async fetchValidators() {
    return await this.withClient(async (client) => {
      const rawValidators = await this.fetchAllPages((paginationOptions) => {
        return client.staking.validators(this.chainId, paginationOptions);
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

  public async fetchRewards({ address }: { address: string }) {
    return await this.withClient(async (client) => {
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
              denom: this.chain.denom,
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

  public withClient<T>(f: (client: LCDClient) => T) {
    return withTerraClient(this.chainId, f);
  }

  public static chainId(chainId: TerraChain) {
    return new TerraSdk(chainId);
  }
}
