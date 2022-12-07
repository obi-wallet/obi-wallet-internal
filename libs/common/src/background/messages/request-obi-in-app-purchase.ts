import { BACKGROUND_PORT, Message } from "@keplr-wallet/router";
import { ProductPurchase } from "react-native-iap";

import { MessageRequesterInternal } from "../../message-requester";

export enum PricingTier {
  Tier8 = "tier-8",
}

export interface RequestObiInAppPurchasePayload {
  readonly pricingTier: PricingTier;
  readonly payload: {
    readonly collectionAddress: string;
    readonly amount: string;
  };
}

export class RequestObiInAppPurchaseMsg extends Message<{ success: boolean }> {
  public static type() {
    return "request-obi-in-app-purchase";
  }

  public static async send(payload: RequestObiInAppPurchasePayload) {
    const msg = new RequestObiInAppPurchaseMsg(payload);
    return await new MessageRequesterInternal().sendMessage(
      BACKGROUND_PORT,
      msg
    );
  }

  constructor(public readonly payload: RequestObiInAppPurchasePayload) {
    super();
  }

  validateBasic(): void {
    if (!this.payload.pricingTier) {
      throw new Error("pricing tier not set");
    }

    if (!this.payload.payload) {
      throw new Error("payload not set");
    }

    if (!this.payload.payload.collectionAddress) {
      throw new Error("collection address not set");
    }

    if (!this.payload.payload.amount) {
      throw new Error("amount not set");
    }
  }

  route(): string {
    return "obi";
  }

  type(): string {
    return RequestObiInAppPurchaseMsg.type();
  }
}
