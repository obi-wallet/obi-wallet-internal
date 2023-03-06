import { BACKGROUND_PORT, Message } from "@keplr-wallet/router";

import { MessageRequesterInternal } from "../../message-requester";
import { MultisigWallet } from "../../stores";
import { EntityId } from "../../stores/entities";

export type RequestObiWalletConnectPayload = {
  type: "session-request";
  peerMeta: {
    description: string;
    icons: string[];
    name: string;
    url: string;
  };
  walletMeta: {
    walletId: EntityId;
    currentAccount: MultisigWallet["_currentAccount"];
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
