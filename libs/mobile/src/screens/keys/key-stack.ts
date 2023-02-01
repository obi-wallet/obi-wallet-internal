import { ParamListBase } from "@react-navigation/native";

export enum KeyRoute {
  DeviceKey = "DeviceKey",
  PhoneKeyRequest = "PhoneKeyRequest",
  PhoneKeyConfirm = "PhoneKeyConfirm",
  SocialKey = "SocialKey",
}

export enum KeyFlow {
  // TODO: rename to Create new wallet
  CreateWallet = "CreateWallet",
  // TODO: rename to Customize existing wallet
  ReplaceKey = "ReplaceKey",
  // TODO: rename to Recover existing wallet
  // Basically goes device > phone > lookup, and then you move to the Customize flow.
  // "Unrecoverable keys", e.g. the previous device key, can be interpreted as a "non-signable" Public key
  RecoverWallet = "RecoverWallet",
}

interface CommonKeyParams {
  draftId: string;
  flow: KeyFlow;
  demoMode: boolean;
}

export interface KeyStackParamList extends ParamListBase {
  [KeyRoute.DeviceKey]: CommonKeyParams;
  [KeyRoute.PhoneKeyRequest]: CommonKeyParams;
  [KeyRoute.PhoneKeyConfirm]: CommonKeyParams & {
    phoneNumber: string;
    securityQuestion: string;
    securityAnswer: string;
  };
  [KeyRoute.SocialKey]: CommonKeyParams;
}
