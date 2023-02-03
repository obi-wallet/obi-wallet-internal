import { MultisigWalletSerializedData } from "@obi-wallet/common";
import { ParamListBase } from "@react-navigation/native";

export enum KeyRoute {
  DeviceKey = "DeviceKey",
  PhoneKeyRequest = "PhoneKeyRequest",
  PhoneKeyConfirm = "PhoneKeyConfirm",
  SocialKey = "SocialKey",
  EmailKey = "EmailKey",
}

export enum KeyFlow {
  CreateWallet = "CreateWallet",
  EditWallet = "EditWallet",
  RecoverWallet = "RecoverWallet",
}

interface CommonKeyParams {
  flow: KeyFlow;
  draftId: string;
  demoMode: boolean;
  serializedData?: MultisigWalletSerializedData.SerializedData;
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
  [KeyRoute.EmailKey]: CommonKeyParams;
}
