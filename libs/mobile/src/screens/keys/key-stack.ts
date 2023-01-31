import { ParamListBase } from "@react-navigation/native";

export enum KeyRoute {
  DeviceKey = "DeviceKey",
  PhoneKeyRequest = "PhoneKeyRequest",
  PhoneKeyConfirm = "PhoneKeyConfirm",
}

export enum KeyFlow {
  CreateWallet = "CreateWallet",
  ReplaceKey = "ReplaceKey",
  RecoverWallet = "RecoverWallet",
}

export interface KeyStackParamList extends ParamListBase {
  [KeyRoute.DeviceKey]: {
    draftId: string;
    flow: KeyFlow;
    demoMode: boolean;
  };
  [KeyRoute.PhoneKeyRequest]: {
    draftId: string;
    flow: KeyFlow;
    demoMode: boolean;
  };
  [KeyRoute.PhoneKeyConfirm]: {
    draftId: string;
    flow: KeyFlow;
    demoMode: boolean;
    phoneNumber: string;
    securityQuestion: string;
    securityAnswer: string;
  };
}
