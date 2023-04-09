import { Chain } from "../../chains";
import { queryClient, QueryClientNamespace } from "../../query-client";
import { Coin } from "../common";

export abstract class AbstractBankSdk {
  protected queryNamespace: QueryClientNamespace<
    "bank-sdk",
    { chainId: Chain }
  >;

  protected constructor(protected chainId: Chain) {
    this.queryNamespace = new QueryClientNamespace("bank-sdk", { chainId });
  }

  /**
   * Balances of the given address.
   *
   * @see {@link balancesQuery} for usage with TanStack Query.
   */
  public balances(address: string) {
    return queryClient.fetchQuery(this.balancesQuery(address));
  }

  public balancesQuery(address: string) {
    return this.queryNamespace.createQuery({
      name: "balances",
      fn: this.balancesQueryFn.bind(this),
      params: address,
    });
  }

  protected abstract balancesQueryFn(address: string): Promise<Coin[]>;

  /**
   * Current USD-equivalent prices of known tokens.
   *
   * @see {@link pricesQuery} for usage with TanStack Query.
   */
  public prices() {
    return queryClient.fetchQuery(this.pricesQuery());
  }

  public pricesQuery() {
    return this.queryNamespace.createQuery({
      name: "prices",
      fn: this.pricesQueryFn.bind(this),
    });
  }

  protected abstract pricesQueryFn(): Promise<Record<string, number>>;
}
