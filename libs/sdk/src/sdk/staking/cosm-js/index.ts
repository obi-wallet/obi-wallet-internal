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
    return Chain.information(this.chainId);
  }
}
