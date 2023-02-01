import { BACKGROUND_PORT, Message } from "@keplr-wallet/router";
import { BlockTxBroadcastResult, Msg } from "@terra-money/terra.js";

import { MessageRequesterInternal } from "../../message-requester";
import { SerializedMultisigKey, KeyType } from "../../stores";

export interface RequestObiTerraSignAndBroadcastPayload {
  readonly multisigKey: SerializedMultisigKey;
  readonly messages: Msg.Amino[];
  readonly demoMode: boolean;
  readonly proxyAddress?: string;
  readonly cancelable?: boolean;
  readonly hiddenKeyTypes?: KeyType[];
  readonly isOnboarding?: boolean;
}

export class RequestObiTerraSignAndBroadcastMsg extends Message<BlockTxBroadcastResult> {
  public static type() {
    return "request-obi-terra-sign-and-broadcast";
  }

  public static async send(payload: RequestObiTerraSignAndBroadcastPayload) {
    const msg = new RequestObiTerraSignAndBroadcastMsg(payload);
    return await new MessageRequesterInternal().sendMessage(
      BACKGROUND_PORT,
      msg
    );
  }

  constructor(public readonly payload: RequestObiTerraSignAndBroadcastPayload) {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return "obi";
  }

  type(): string {
    return RequestObiTerraSignAndBroadcastMsg.type();
  }
}
