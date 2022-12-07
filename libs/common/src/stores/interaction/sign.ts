import { DeliverTxResponse } from "@cosmjs/stargate";
import { InteractionStore as KeplrInteractionStore } from "@keplr-wallet/stores";

import {
  RequestObiSignAndBroadcastMsg,
  RequestObiSignAndBroadcastPayload,
} from "../../background";
import { AbstractSingletonInteractionStore } from "./abstract-singleton";

export class SignInteractionStore extends AbstractSingletonInteractionStore<
  RequestObiSignAndBroadcastPayload,
  DeliverTxResponse
> {
  constructor(interactionStore: KeplrInteractionStore) {
    super({
      interactionStore,
      type: RequestObiSignAndBroadcastMsg.type(),
    });
  }
}
