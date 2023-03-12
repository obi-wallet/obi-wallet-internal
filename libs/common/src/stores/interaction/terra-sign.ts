import { InteractionStore as KeplrInteractionStore } from "@keplr-wallet/stores";
import { BlockTxBroadcastResult } from "@terra-money/feather.js";

import { AbstractSingletonInteractionStore } from "./abstract-singleton";
import {
  RequestObiSignAndBroadcastTerraTransactionMsg,
  RequestObiSignAndBroadcastTerraTransactionPayload,
} from "../../background";

export class TerraSignInteractionStore extends AbstractSingletonInteractionStore<
  RequestObiSignAndBroadcastTerraTransactionPayload,
  BlockTxBroadcastResult
> {
  constructor(interactionStore: KeplrInteractionStore) {
    super({
      interactionStore,
      type: RequestObiSignAndBroadcastTerraTransactionMsg.type(),
    });
  }
}
