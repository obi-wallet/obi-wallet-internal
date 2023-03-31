export interface BroadcastTransactionResult {
  success: boolean;
  transactionHash: string;
  rawLog?: string;
  rawResult: unknown;
}
