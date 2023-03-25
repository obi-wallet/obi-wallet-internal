import {
  SignAndBroadcastTransactionUserInteraction,
  wrapMessages as sdkWrapMessages,
} from "@obi-wallet/sdk";
import { Msg } from "@terra-money/feather.js";

export interface AbstractSignatureModalProps {
  interaction: SignAndBroadcastTransactionUserInteraction;
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
