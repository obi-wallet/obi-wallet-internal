import { EncodeObject } from "@cosmjs/proto-signing";
import { DeliverTxResponse } from "@cosmjs/stargate";
import { BACKGROUND_PORT, Message } from "@keplr-wallet/router";
import { KeyType, MultisigKey, Serialized } from "@obi-wallet/sdk";

import { MessageRequesterInternal } from "../../message-requester";

export interface RequestObiCosmosSignAndBroadcastPayload {
  readonly multisigKey: Serialized<typeof MultisigKey>;
  readonly encodeObjects: EncodeObject[];
  readonly demoMode: boolean;
  readonly proxyAddress?: string;
  readonly cancelable?: boolean;
  readonly hiddenKeyTypes?: KeyType[];
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
    // noop
  }

  route(): string {
    return "obi";
  }

  type(): string {
    return RequestObiCosmosSignAndBroadcastMsg.type();
  }
}
