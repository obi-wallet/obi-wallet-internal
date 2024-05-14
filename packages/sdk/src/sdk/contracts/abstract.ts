import { queryClient, QueryClientNamespace } from "@obi-wallet/query-client";

import { ChainId } from "../../chains";

export abstract class AbstractContractsSdk {
  protected queryNamespace: QueryClientNamespace<
    "contracts-sdk",
    { chainId: ChainId }
  >;

  protected constructor(protected chainId: ChainId) {
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

  public get codeIdQuery() {
    return this.queryNamespace.createQuery({
      name: "codeId",
      fn: this.codeIdQueryFn.bind(this),
    });
  }

  protected abstract codeIdQueryFn(contract: string): Promise<number>;
}
