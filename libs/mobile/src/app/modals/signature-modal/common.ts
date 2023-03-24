import { lendFees, terra } from "@obi-wallet/common";
import {
  Chain,
  isTerraChain,
  SignAndBroadcastTransactionUserInteraction,
  withTerraClient,
  wrapMessages as sdkWrapMessages,
} from "@obi-wallet/sdk";
import {
  BlockTxBroadcastResult,
  isTxError,
  Msg,
  Tx,
} from "@terra-money/feather.js";
import invariant from "tiny-invariant";

export interface AbstractSignatureModalProps {
  interaction: SignAndBroadcastTransactionUserInteraction;
}

export async function broadcastTransaction({
  chainId,
  interaction,
  sender,
  transaction,
}: {
  chainId: Chain;
  interaction: SignAndBroadcastTransactionUserInteraction;
  sender: string;
  transaction: Tx;
}) {
  invariant(isTerraChain(chainId), "Only Terra is supported");
  const { payload } = interaction;
  if (payload.demoMode) {
    await terra.simulateTransaction({
      transaction,
      chainId,
    });
    // This is only for demo mode
    return {} as BlockTxBroadcastResult;
  } else {
    let response = await withTerraClient(chainId, async (client) => {
      return await client.tx.broadcastBlock(transaction, chainId);
    });
    if (isTxError(response)) {
      if (response.raw_log.includes("insufficient funds")) {
        await lendFees({
          chainId,
          address: sender,
        });
        response = await withTerraClient(chainId, async (client) => {
          return await client.tx.broadcastBlock(transaction, chainId);
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

  return sdkWrapMessages({
    messages,
    sender,
    contract: proxyAddress,
  });
}
