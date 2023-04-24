import * as R from "ramda";

import { Chain } from "../../chains";
import { queryClient, QueryClientNamespace } from "../../query-client";
import { EnrichedToken, Token } from "../common";

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

  protected abstract balancesQueryFn(address: string): Promise<Token[]>;

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

  public enrichToken(
    token: Token,
    prices?: Record<string, number>
  ): EnrichedToken {
    const enrichedToken = this.enrichTokenWithoutUsdValue(token);
    return {
      ...enrichedToken,
      usdValue: R.has(token.id, prices)
        ? prices[token.id] * enrichedToken.amount
        : null,
    };
  }

  protected enrichTokenWithoutUsdValue(token: Token): EnrichedToken {
    const digits = 6;
    const amount = parseInt(token.amount, 10) / 10 ** digits;
    return {
      id: token.id,
      contract: null,
      icon: null,
      denom: token.id,
      digits: 6,
      label: "Unknown Token",
      amount: amount,
      usdValue: null,
    };
  }
}
