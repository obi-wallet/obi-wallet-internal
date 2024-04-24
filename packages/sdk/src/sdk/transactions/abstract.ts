import invariant from "tiny-invariant";

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

  // TODO: mutation with retry
  protected async lendFees(address: string) {
    invariant(this.validateAddress(address), "Invalid address");
    const response = await fetch(
      "https://fee-lender-worker.obiwallet.workers.dev/",
      {
        method: "POST",
        body: `${this.chainId},${address}`,
      },
    );
    if (response.status !== 200) {
      console.log(response);
      throw new Error("Lending fees failed");
    }
  }

  protected wait({ ms }: { ms: number }): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
