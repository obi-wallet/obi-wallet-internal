import { Chain } from "../../chains";
import { queryClient, QueryClientNamespace } from "../../query-client";

export abstract class AbstractContractsSdk {
  protected queryNamespace: QueryClientNamespace<
    "contracts-sdk",
    { chainId: Chain }
  >;

  protected constructor(protected chainId: Chain) {
    this.queryNamespace = new QueryClientNamespace("contracts-sdk", {
      chainId,
    });
  }

  /**
   * Fetches the code ID of the given contract.
   *
   * @see {@link codeIdQuery} for usage with TanStack Query.
   */
  public codeId(contract: string) {
    return queryClient.fetchQuery(this.codeIdQuery(contract));
  }

  public codeIdQuery(contract: string) {
    return this.queryNamespace.createQuery({
      name: "codeId",
      fn: this.codeIdQueryFn.bind(this),
      params: contract,
    });
  }

  protected abstract codeIdQueryFn(contract: string): Promise<number>;
}
