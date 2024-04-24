import { ChainId } from "../../chains";
import { PublicKey } from "../../keys";
import { QueryClientNamespace } from "../../query-client";

export abstract class AbstractTransactionsSdk {
  protected queryNamespace: QueryClientNamespace<
    "transactions-sdk",
    { chainId: ChainId }
  >;

  protected constructor(protected chainId: ChainId) {
    this.queryNamespace = new QueryClientNamespace("transactions-sdk", {
      chainId,
    });
  }

  /**
   * Address of the given public key.
   */
  public abstract getAddressOfPublicKey(publicKey: PublicKey): string;
}
