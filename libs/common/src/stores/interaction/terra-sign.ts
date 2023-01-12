import { InteractionStore as KeplrInteractionStore } from "@keplr-wallet/stores";
import { BlockTxBroadcastResult } from "@terra-money/terra.js";

import {
  RequestObiTerraSignAndBroadcastMsg,
  RequestObiTerraSignAndBroadcastPayload,
} from "../../background";
import { AbstractSingletonInteractionStore } from "./abstract-singleton";

export class TerraSignInteractionStore extends AbstractSingletonInteractionStore<
  RequestObiTerraSignAndBroadcastPayload,
  BlockTxBroadcastResult
> {
  constructor(interactionStore: KeplrInteractionStore) {
    super({
      interactionStore,
      type: RequestObiTerraSignAndBroadcastMsg.type(),
    });
  }
}
