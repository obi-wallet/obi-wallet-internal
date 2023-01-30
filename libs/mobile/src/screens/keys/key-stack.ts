import { ParamListBase } from "@react-navigation/native";

export enum KeyRoute {
  PhoneKeyRequest = "PhoneKeyRequest",
  PhoneKeyConfirm = "PhoneKeyConfirm",
}

export interface KeyStackParamList extends ParamListBase {
  [KeyRoute.PhoneKeyRequest]: {
    draftId: string;
    flavor: "recover-phone" | "recover-other" | "create";
    demoMode: boolean;
  };
  [KeyRoute.PhoneKeyConfirm]: {
    draftId: string;
    flavor: "recover-phone" | "recover-other" | "create";
    demoMode: boolean;
    phoneNumber: string;
    securityQuestion: string;
    securityAnswer: string;
  };
}
