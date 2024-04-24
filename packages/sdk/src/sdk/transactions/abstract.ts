import { ChainId } from "../../chains";
import { PublicKey } from "../../keys";
import { QueryClientNamespace } from "../../query-client";
import { SignedTransaction } from "../../transactions";
import { BroadcastTransactionResult } from "../common";

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

  /**
   * Validates the given address
   */
  public abstract validateAddress(address: string): boolean;

  /**
   * Broadcasts a signed transaction.
   */
  public abstract broadcastSignedTransaction({
    signedTransaction,
  }: {
    signedTransaction: SignedTransaction;
  }): Promise<BroadcastTransactionResult>;

  /**
   * Broadcasts a signed transaction and lends fees if necessary.
   */
  public abstract broadcastSignedTransactionAndLendFees({
    signedTransaction,
    sender,
  }: {
    signedTransaction: SignedTransaction;
    sender: string;
  }): Promise<BroadcastTransactionResult>;

  protected wait({ ms }: { ms: number }): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
