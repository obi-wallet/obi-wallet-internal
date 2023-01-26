import { InteractionStore as KeplrInteractionStore } from "@keplr-wallet/stores";

import { AbstractSingletonInteractionStore } from "./abstract-singleton";
import {
  RequestObiInAppPurchaseMsg,
  RequestObiInAppPurchasePayload,
} from "../../background";

export class InAppPurchaseInteractionStore extends AbstractSingletonInteractionStore<
  RequestObiInAppPurchasePayload,
  { success: boolean }
> {
  constructor(interactionStore: KeplrInteractionStore) {
    super({
      interactionStore,
      type: RequestObiInAppPurchaseMsg.type(),
    });
  }
}
