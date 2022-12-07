import { RequestObiInAppPurchaseMsg } from "./request-obi-in-app-purchase";
import { RequestObiSignAndBroadcastMsg } from "./request-obi-sign-and-broadcast";

export * from "./request-obi-in-app-purchase";
export * from "./request-obi-sign-and-broadcast";

export type ObiMessage =
  | RequestObiInAppPurchaseMsg
  | RequestObiSignAndBroadcastMsg;
