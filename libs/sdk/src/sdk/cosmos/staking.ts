import warning from "tiny-warning";

import { CosmosClient } from "./client";
import { CosmosChain, cosmosChains } from "../../chains";
import { AbstractStakingSdk } from "../abstract";
import {
  Delegation,
  EnrichedValidator,
  Rewards,
  UnbondingDelegation,
} from "../common";

function notImplemented(message: string) {
  warning(false, message);
}

export class CosmosStakingSdk extends AbstractStakingSdk {
  protected chainId: CosmosChain;
  protected client: CosmosClient;

  public constructor({
    chainId,
    client,
  }: {
    chainId: CosmosChain;
    client: CosmosClient;
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

  protected async rewardsQueryFn(_: string): Promise<Rewards> {
    notImplemented("fetchRewards not implemented for Cosmos");
    return {
      perDelegator: [],
      total: {
        id: this.chain.denom,
        rawAmount: "0",
      },
    };
  }

  protected get chain() {
    return cosmosChains[this.chainId];
  }
}
