import {
  lendFees,
  RequestObiSignAndBroadcastTerraTransactionPayload,
  terra,
} from "@obi-wallet/common";
import { withTerraClient } from "@obi-wallet/sdk";
import {
  BlockTxBroadcastResult,
  isTxError,
  Msg,
  Tx,
} from "@terra-money/feather.js";

export interface AbstractSignatureModalProps {
  data: RequestObiSignAndBroadcastTerraTransactionPayload;
  onConfirm: (transaction: BlockTxBroadcastResult) => Promise<void>;
  onCancel: () => Promise<void>;
}

export async function broadcastTransaction({
  data,
  sender,
  transaction,
}: {
  data: RequestObiSignAndBroadcastTerraTransactionPayload;
  sender: string;
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
    let response = await withTerraClient(data.chain, async (client) => {
      return await client.tx.broadcastBlock(transaction, data.chain);
    });
    if (isTxError(response)) {
      if (response.raw_log.includes("insufficient funds")) {
        await lendFees({
          chainId: data.chain,
          address: sender,
        });
        response = await withTerraClient(data.chain, async (client) => {
          return await client.tx.broadcastBlock(transaction, data.chain);
        });
      }
    }
    return response;
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
