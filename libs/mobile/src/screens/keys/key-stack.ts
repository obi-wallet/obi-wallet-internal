import { ParamListBase } from "@react-navigation/native";

export enum KeyRoute {
  DeviceKey = "DeviceKey",
  PhoneKeyRequest = "PhoneKeyRequest",
  PhoneKeyConfirm = "PhoneKeyConfirm",
  SocialKey = "SocialKey",
}

export enum KeyFlow {
  CreateWallet = "CreateWallet",
  ReplaceKey = "ReplaceKey",
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
