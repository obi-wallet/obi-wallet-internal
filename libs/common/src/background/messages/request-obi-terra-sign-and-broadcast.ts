import { BACKGROUND_PORT, Message } from "@keplr-wallet/router";
import { BlockTxBroadcastResult, Msg } from "@terra-money/terra.js";

import { MessageRequesterInternal } from "../../message-requester";
import { MultisigKey, TerraMultisig } from "../../stores";

export interface RequestObiTerraSignAndBroadcastPayload {
  readonly id: string;
  readonly multisig: TerraMultisig;
  readonly messages: Msg.Amino[];
  readonly wrap?: boolean;
  readonly cancelable?: boolean;
  readonly hiddenKeyIds?: MultisigKey[];
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
    if (!this.payload.id) {
      throw new Error("id not set");
    }

    if (!this.payload.multisig) {
      throw new Error("multisig not set");
    }

    if (!this.payload.messages) {
      throw new Error("messages not set");
    }
  }

  route(): string {
    return "obi";
  }

  type(): string {
    return RequestObiTerraSignAndBroadcastMsg.type();
  }
}
