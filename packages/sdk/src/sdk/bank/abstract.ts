import { queryClient, QueryClientNamespace } from "@obi-wallet/query-client";

import { HomeChainId } from "../../home-chains";
import { EnrichedToken, Token } from "../common";

export abstract class AbstractBankSdk {
  protected queryNamespace: QueryClientNamespace<
    "bank-sdk",
    { chainId: HomeChainId }
  >;

  protected constructor(protected chainId: HomeChainId) {
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

  public get balancesQuery() {
    return this.queryNamespace.createQuery({
      name: "balances",
      fn: this.balancesQueryFn.bind(this),
    });
  }

  protected abstract balancesQueryFn(address: string): Promise<Token[]>;

  /**
   * Current USD-equivalent prices of known tokens.
   *
   * @see {@link pricesQuery} for usage with TanStack Query.
   */
  public prices() {
    return queryClient.fetchQuery(this.pricesQuery(undefined));
  }

  public get pricesQuery() {
    return this.queryNamespace.createQuery({
      name: "prices",
      fn: this.pricesQueryFn.bind(this),
    });
  }

  protected abstract pricesQueryFn(): Promise<Record<string, number>>;

  public enrichToken(
    token: Token,
    prices?: Record<string, number>,
  ): EnrichedToken {
    const enrichedToken = this.enrichTokenWithoutUsdValue(token);
    const price = prices?.[token.id];
    return {
      ...enrichedToken,
      usdValue: price ? price * enrichedToken.amount : null,
    };
  }

  protected enrichTokenWithoutUsdValue(token: Token): EnrichedToken {
    const digits = 6;
    return {
      ...token,
      amount: parseInt(token.rawAmount, 10) / 10 ** digits,
      contract: null,
      icon: null,
      denom: token.id,
      digits: 6,
      label: "Unknown Token",
      usdValue: null,
    };
  }
}
