import {
  RequestObiSignAndBroadcastTerraTransactionPayload,
  terra,
  withLcdClient,
} from "@obi-wallet/common";
import { BlockTxBroadcastResult, Msg, Tx } from "@terra-money/terra.js";

export interface AbstractSignatureModalProps {
  data: RequestObiSignAndBroadcastTerraTransactionPayload;
  onConfirm: (transaction: BlockTxBroadcastResult) => Promise<void>;
  onCancel: () => Promise<void>;
}

export async function broadcastTransaction({
  data,
  transaction,
}: {
  data: RequestObiSignAndBroadcastTerraTransactionPayload;
  transaction: Tx;
}) {
  if (data.demoMode) {
    await terra.simulateTransaction({
      transaction,
      chainId: data.chain,
    });
    // This is only for demo mode
    return {} as BlockTxBroadcastResult;
  } else {
    return await withLcdClient(data.chain, async (client) => {
      return await client.tx.broadcastBlock(transaction);
    });
  }
}

export function wrapMessages({
  messages,
  proxyAddress,
  sender,
}: {
  messages: Msg[];
  proxyAddress?: string;
  sender: string;
}): Msg[] {
  if (!proxyAddress) return messages;

  return terra.wrapMessages({
    messages,
    sender,
    contract: proxyAddress,
  });
}
