import {
  BACKGROUND_PORT,
  Message as AbstractMessage,
} from "@keplr-wallet/router";

import { MessageRequesterInternal } from "../../message-requester";

export function createMessage<TPayload, TResponse>({ type }: { type: string }) {
  class Message extends AbstractMessage<TResponse> {
    public static type() {
      return type;
    }

    public static async send(payload: TPayload) {
      const msg = new Message(payload);
      return await new MessageRequesterInternal().sendMessage(
        BACKGROUND_PORT,
        msg
      );
    }

    constructor(public readonly payload: TPayload) {
      super();
    }

    public validateBasic(): void {
      // noop
    }

    public route(): string {
      return "obi";
    }

    public type(): string {
      return Message.type();
    }
  }

  return Message;
}
