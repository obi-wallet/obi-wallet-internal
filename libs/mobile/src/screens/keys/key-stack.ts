import { MultisigWalletSerializedData } from "@obi-wallet/common";
import { ParamListBase } from "@react-navigation/native";

export enum KeyRoute {
  DeviceKey = "DeviceKey",
  EmailKey = "EmailKey",
  PhoneKeyRequest = "PhoneKeyRequest",
  PhoneKeyConfirm = "PhoneKeyConfirm",
  SocialKey = "SocialKey",
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
  [KeyRoute.EmailKey]: CommonKeyParams;
  [KeyRoute.PhoneKeyRequest]: CommonKeyParams;
  [KeyRoute.PhoneKeyConfirm]: CommonKeyParams & {
    phoneNumber: string;
    securityQuestion: string;
    securityAnswer: string;
  };
  [KeyRoute.SocialKey]: CommonKeyParams;
}
