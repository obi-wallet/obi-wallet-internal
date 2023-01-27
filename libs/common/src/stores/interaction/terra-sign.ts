import { InteractionStore as KeplrInteractionStore } from "@keplr-wallet/stores";
import { BlockTxBroadcastResult } from "@terra-money/terra.js";

import { AbstractSingletonInteractionStore } from "./abstract-singleton";
import {
  RequestObiTerraSignAndBroadcastMsg,
  RequestObiTerraSignAndBroadcastPayload,
} from "../../background";

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
