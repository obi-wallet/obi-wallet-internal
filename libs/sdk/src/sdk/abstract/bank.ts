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

  public fetchBalances(address: string) {
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
}
