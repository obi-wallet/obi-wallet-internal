import { InteractionStore as KeplrInteractionStore } from "@keplr-wallet/stores";

import { AbstractSingletonInteractionStore } from "./abstract-singleton";
import {
  RequestObiWalletConnectMsg,
  RequestObiWalletConnectPayload,
} from "../../background";

export class WalletConnectInteractionStore extends AbstractSingletonInteractionStore<
  RequestObiWalletConnectPayload,
  void
> {
  constructor(interactionStore: KeplrInteractionStore) {
    super({
      interactionStore,
      type: RequestObiWalletConnectMsg.type(),
    });
  }
}
