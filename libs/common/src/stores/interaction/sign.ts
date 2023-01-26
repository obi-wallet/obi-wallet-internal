import { DeliverTxResponse } from "@cosmjs/stargate";
import { InteractionStore as KeplrInteractionStore } from "@keplr-wallet/stores";

import { AbstractSingletonInteractionStore } from "./abstract-singleton";
import {
  RequestObiCosmosSignAndBroadcastMsg,
  RequestObiCosmosSignAndBroadcastPayload,
} from "../../background";

export class SignInteractionStore extends AbstractSingletonInteractionStore<
  RequestObiCosmosSignAndBroadcastPayload,
  DeliverTxResponse
> {
  constructor(interactionStore: KeplrInteractionStore) {
    super({
      interactionStore,
      type: RequestObiCosmosSignAndBroadcastMsg.type(),
    });
  }
}
