import { InteractionStore as KeplrInteractionStore } from "@keplr-wallet/stores";

import {
  RequestObiInAppPurchaseMsg,
  RequestObiInAppPurchasePayload,
} from "../../background";
import { AbstractSingletonInteractionStore } from "./abstract-singleton";

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
