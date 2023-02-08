import { BACKGROUND_PORT, Message } from "@keplr-wallet/router";

import { MessageRequesterInternal } from "../../message-requester";

export type RequestObiWalletConnectPayload = {
  type: "session-request";
  peerMeta: {
    description: string;
    icons: string[];
    name: string;
    url: string;
  };
};

export class RequestObiWalletConnectMsg extends Message<void> {
  public static type() {
    return "request-obi-wallet-connect";
  }

  public static async send(payload: RequestObiWalletConnectPayload) {
    const msg = new RequestObiWalletConnectMsg(payload);
    return await new MessageRequesterInternal().sendMessage(
      BACKGROUND_PORT,
      msg
    );
  }

  constructor(public readonly payload: RequestObiWalletConnectPayload) {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return "obi";
  }

  type(): string {
    return RequestObiWalletConnectMsg.type();
  }
}
