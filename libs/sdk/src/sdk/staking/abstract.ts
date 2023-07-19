import { ChainId } from "../../chains";
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
    { chainId: ChainId }
  >;

  protected constructor(protected chainId: ChainId) {
    this.queryNamespace = new QueryClientNamespace("staking-sdk", { chainId });
  }

  /**
   * List of all validators.
   *
   * @see {@link validatorsQuery} for usage with TanStack Query.
   */
  public validators() {
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

  /**
   * Delegations of the given address.
   *
   * @see {@link delegationsQuery} for usage with TanStack Query.
   */
  public delegations(address: string) {
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

  /**
   * Unbonding delegations of the given address.
   *
   * @see {@link unbondingDelegationsQuery} for usage with TanStack Query.
   */
  public unbondingDelegations(address: string) {
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
    address: string,
  ): Promise<UnbondingDelegation[]>;

  /**
   * All pending rewards of the given address.
   *
   * @see {@link rewardsQuery} for usage with TanStack Query.
   */
  public rewards(address: string) {
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
