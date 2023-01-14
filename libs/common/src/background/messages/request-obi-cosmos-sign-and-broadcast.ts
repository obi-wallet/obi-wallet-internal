import { EncodeObject } from "@cosmjs/proto-signing";
import { DeliverTxResponse } from "@cosmjs/stargate";
import { BACKGROUND_PORT, Message } from "@keplr-wallet/router";

import { MessageRequesterInternal } from "../../message-requester";
import { CosmosMultisig, CosmosMultisigKey } from "../../stores";

export interface RequestObiCosmosSignAndBroadcastPayload {
  readonly id: string;
  readonly multisig: CosmosMultisig | null;
  readonly encodeObjects: EncodeObject[];
  readonly wrap?: boolean;
  readonly cancelable?: boolean;
  readonly hiddenKeyIds?: CosmosMultisigKey[];
  readonly isOnboarding?: boolean;
}

export class RequestObiCosmosSignAndBroadcastMsg extends Message<DeliverTxResponse> {
  public static type() {
    return "request-obi-cosmos-sign-and-broadcast";
  }

  public static async send(payload: RequestObiCosmosSignAndBroadcastPayload) {
    const msg = new RequestObiCosmosSignAndBroadcastMsg(payload);
    return await new MessageRequesterInternal().sendMessage(
      BACKGROUND_PORT,
      msg
    );
  }

  constructor(
    public readonly payload: RequestObiCosmosSignAndBroadcastPayload
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.payload.id) {
      throw new Error("id not set");
    }

    if (!this.payload.encodeObjects) {
      throw new Error("encodeObjects not set");
    }
  }

  route(): string {
    return "obi";
  }

  type(): string {
    return RequestObiCosmosSignAndBroadcastMsg.type();
  }
}
