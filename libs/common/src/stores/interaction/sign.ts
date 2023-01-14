import { DeliverTxResponse } from "@cosmjs/stargate";
import { InteractionStore as KeplrInteractionStore } from "@keplr-wallet/stores";

import {
  RequestObiCosmosSignAndBroadcastMsg,
  RequestObiCosmosSignAndBroadcastPayload,
} from "../../background";
import { AbstractSingletonInteractionStore } from "./abstract-singleton";

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
