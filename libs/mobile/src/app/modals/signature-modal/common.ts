import {
  lendFees,
  RequestObiSignAndBroadcastTerraTransactionPayload,
  terra,
  withLcdClient,
} from "@obi-wallet/common";
import {
  BlockTxBroadcastResult,
  isTxError,
  Msg,
  Tx,
} from "@terra-money/terra.js";

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
    let response = await withLcdClient(data.chain, async (client) => {
      return await client.tx.broadcastBlock(transaction);
    });
    if (isTxError(response)) {
      if (response.raw_log.includes("insufficient funds")) {
        await lendFees({
          chainId: data.chain,
          address: sender,
        });
        response = await withLcdClient(data.chain, async (client) => {
          return await client.tx.broadcastBlock(transaction);
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
