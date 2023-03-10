import { BlockTxBroadcastResult, Msg } from "@terra-money/terra.js";

import { CommonPayload } from "./common";
import { TerraChain } from "../../../chains";
import { createMessage } from "../helpers";

export type RequestObiSignAndBroadcastTerraTransactionPayload = {
  readonly chain: TerraChain;
  readonly messages: Msg.Amino[];
} & CommonPayload;

export const RequestObiSignAndBroadcastTerraTransactionMsg = createMessage<
  RequestObiSignAndBroadcastTerraTransactionPayload,
  BlockTxBroadcastResult
>({
  type: "request-obi-sign-and-broadcast-terra-transaction",
});

export type RequestObiSignAndBroadcastTerraTransactionMsg = InstanceType<
  typeof RequestObiSignAndBroadcastTerraTransactionMsg
>;
