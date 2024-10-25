import warning from "tiny-warning";

import { AbstractStakingSdk } from "./abstract";
import { HomeChainId, SecretJsHomeChains } from "../../home-chains";
import {
  Delegation,
  EnrichedValidator,
  Rewards,
  UnbondingDelegation,
} from "../common";

function notImplemented(message: string) {
  warning(false, message);
}

export class NotImplementedStakingSdk extends AbstractStakingSdk {
  public constructor(chainId: HomeChainId) {
    super(chainId);
  }

  protected async delegationsQueryFn(_: string): Promise<Delegation[]> {
    notImplemented("delegationsQueryFn not implemented");
    return [];
  }

  protected async rewardsQueryFn(_: string): Promise<Rewards> {
    notImplemented("rewardsQueryFn not implemented");
    return {
      perDelegator: [],
      total: {
        id: this.chain.denom,
        rawAmount: "0",
      },
    };
  }

  protected async unbondingDelegationsQueryFn(
    _: string,
  ): Promise<UnbondingDelegation[]> {
    notImplemented("unbondingDelegationsQueryFn not implemented");
    return [];
  }

  protected async validatorsQueryFn(): Promise<EnrichedValidator[]> {
    notImplemented("validatorsQueryFn not implemented");
    return [];
  }

  protected get chain() {
    return SecretJsHomeChains[this.chainId];
  }
}
