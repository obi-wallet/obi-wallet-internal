/**
 * Generic interface for broadcast results
 */
export interface BroadcastTransactionResult {
  /**
   * Whether the transaction was successful
   */
  success: boolean;
  /**
   * The transaction hash
   */
  transactionHash: string;
  /**
   * The raw log of the transaction
   */
  rawLog?: string;
  /**
   * The raw result of the transaction. Contains a chain-specific data structure.
   */
  rawResult: any;
}
