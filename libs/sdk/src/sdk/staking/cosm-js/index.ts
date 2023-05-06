import { DecCoin } from "cosmjs-types/cosmos/base/v1beta1/coin";
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

  protected async delegationsQueryFn(_: string): Promise<Delegation[]> {
    notImplemented("fetchDelegations not implemented for Cosmos");
    return [];
  }

  protected async unbondingDelegationsQueryFn(
    _: string
  ): Promise<UnbondingDelegation[]> {
    notImplemented("fetchUnbondingDelegations not implemented for Cosmos");
    return [];
  }

  protected async rewardsQueryFn(address: string): Promise<Rewards> {
    return await this.client.withDistributionExtension(
      async ({ distribution }) => {
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
      }
    );
  }

  protected get chain() {
    return Chain.information(this.chainId);
  }
}
