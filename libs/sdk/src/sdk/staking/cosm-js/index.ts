import { DecCoin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import * as R from "ramda";
import warning from "tiny-warning";

import { Chain, CosmosChainId, LegacyCosmosChainId } from "../../../chains";
import { CosmJsClient } from "../../../clients";
import {
  Delegation,
  EnrichedValidator,
  Rewards,
  UnbondingDelegation,
} from "../../common";
import { AbstractStakingSdk } from "../abstract";

function notImplemented(message: string) {
  warning(false, message);
}

export class CosmJsStakingSdk extends AbstractStakingSdk {
  protected chainId: CosmosChainId | LegacyCosmosChainId;
  protected client: CosmJsClient;

  public constructor({
    chainId,
    client,
  }: {
    chainId: CosmosChainId | LegacyCosmosChainId;
    client: CosmJsClient;
  }) {
    super(chainId);
    this.chainId = chainId;
    this.client = client;
  }

  protected async validatorsQueryFn(): Promise<EnrichedValidator[]> {
    notImplemented("fetchValidators not implemented for Cosmos");
    return [];
  }

  protected async delegationsQueryFn(address: string): Promise<Delegation[]> {
    return await this.client.withStakingExtensions(async ({ staking }) => {
      const rawDelegations = await this.client.fetchAllPages(
        async (paginationKey) => {
          const { delegationResponses, pagination } =
            await staking.delegatorDelegations(address, paginationKey);
          return [delegationResponses, pagination];
        }
      );
      return (
        await Promise.all(
          rawDelegations.map(async (delegation): Promise<Delegation | null> => {
            if (!delegation.balance || !delegation.delegation) return null;
            const validator = await staking.validator(
              delegation.delegation.validatorAddress
            );
            return {
              balance: {
                id: delegation.balance.denom,
                rawAmount: delegation.balance.amount,
              },
              validator: {
                icon: "",
                label:
                  validator.validator?.description?.moniker ??
                  delegation.delegation.validatorAddress,
                address: delegation.delegation.validatorAddress,
              },
            };
          })
        )
      ).filter((delegation): delegation is Delegation => !!delegation);
    });
  }

  protected async unbondingDelegationsQueryFn(
    address: string
  ): Promise<UnbondingDelegation[]> {
    return await this.client.withStakingExtensions(async ({ staking }) => {
      const rawUnbondingDelegations = await this.client.fetchAllPages(
        async (paginationKey) => {
          const { unbondingResponses, pagination } =
            await staking.delegatorUnbondingDelegations(address, paginationKey);
          return [unbondingResponses, pagination];
        }
      );
      return R.flatten(
        await Promise.all(
          rawUnbondingDelegations.map(
            async (unbondingDelegation): Promise<UnbondingDelegation[]> => {
              const validator = await staking.validator(
                unbondingDelegation.validatorAddress
              );

              return unbondingDelegation.entries.map(
                (entry): UnbondingDelegation => {
                  return {
                    balance: {
                      id: this.chain.denom,
                      rawAmount: entry.balance.toString(),
                    },
                    validator: {
                      icon: "",
                      label:
                        validator.validator?.description?.moniker ??
                        unbondingDelegation.validatorAddress,
                      address: unbondingDelegation.validatorAddress,
                    },
                    completionTime: new Date(
                      entry.completionTime?.seconds.toNumber() ?? 0
                    ),
                  };
                }
              );
            }
          )
        )
      );
    });
  }

  protected async rewardsQueryFn(address: string): Promise<Rewards> {
    return await this.client.withStakingExtensions(async ({ distribution }) => {
      const rewards = await distribution.delegationTotalRewards(address);

      const handleRewards = (coins: DecCoin[]) => {
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

      const perDelegator = rewards.rewards.map((reward) => {
        return {
          address: reward.validatorAddress,
          rewards: handleRewards(reward.reward),
        };
      });
      const total = handleRewards(rewards.total);

      return {
        perDelegator,
        total,
      };
    });
  }

  protected get chain() {
    return Chain.information(this.chainId);
  }
}
