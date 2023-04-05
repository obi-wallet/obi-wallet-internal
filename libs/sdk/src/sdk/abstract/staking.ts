import { Chain } from "../../chains";
import { queryClient, QueryClientNamespace } from "../../query-client";
import {
  Delegation,
  EnrichedValidator,
  Rewards,
  UnbondingDelegation,
} from "../common";

export abstract class AbstractStakingSdk {
  protected queryNamespace: QueryClientNamespace<
    "staking-sdk",
    { chainId: Chain }
  >;

  protected constructor(protected chainId: Chain) {
    this.queryNamespace = new QueryClientNamespace("staking-sdk", { chainId });
  }

  public fetchValidators() {
    return queryClient.fetchQuery(this.validatorsQuery());
  }

  public validatorsQuery() {
    return this.queryNamespace.createQuery({
      name: "validators",
      fn: this.validatorsQueryFn.bind(this),
      staleTime: { day: 1 },
    });
  }

  protected abstract validatorsQueryFn(): Promise<EnrichedValidator[]>;

  public fetchDelegations(address: string) {
    return queryClient.fetchQuery(this.delegationsQuery(address));
  }

  public delegationsQuery(address: string) {
    return this.queryNamespace.createQuery({
      name: "delegations",
      fn: this.delegationsQueryFn.bind(this),
      params: address,
    });
  }

  protected abstract delegationsQueryFn(address: string): Promise<Delegation[]>;

  public fetchUnbondingDelegations(address: string) {
    return queryClient.fetchQuery(this.unbondingDelegationsQuery(address));
  }

  public unbondingDelegationsQuery(address: string) {
    return this.queryNamespace.createQuery({
      name: "unbondingDelegations",
      fn: this.unbondingDelegationsQueryFn.bind(this),
      params: address,
    });
  }

  protected abstract unbondingDelegationsQueryFn(
    address: string
  ): Promise<UnbondingDelegation[]>;

  public fetchRewards(address: string) {
    return queryClient.fetchQuery(this.rewardsQuery(address));
  }

  public rewardsQuery(address: string) {
    return this.queryNamespace.createQuery({
      name: "rewards",
      fn: this.rewardsQueryFn.bind(this),
      params: address,
    });
  }

  protected abstract rewardsQueryFn(address: string): Promise<Rewards>;
}
