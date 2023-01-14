import { RequestObiCosmosSignAndBroadcastMsg } from "./request-obi-cosmos-sign-and-broadcast";
import { RequestObiInAppPurchaseMsg } from "./request-obi-in-app-purchase";
import { RequestObiTerraSignAndBroadcastMsg } from "./request-obi-terra-sign-and-broadcast";

export * from "./request-obi-in-app-purchase";
export * from "./request-obi-cosmos-sign-and-broadcast";
export * from "./request-obi-terra-sign-and-broadcast";

export type ObiMessage =
  | RequestObiInAppPurchaseMsg
  | RequestObiCosmosSignAndBroadcastMsg
  | RequestObiTerraSignAndBroadcastMsg;
