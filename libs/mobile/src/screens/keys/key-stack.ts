import { MultisigWallet, Serialized } from "@obi-wallet/sdk";
import { ParamListBase } from "@react-navigation/native";

export enum KeyRoute {
  DeviceKey = "DeviceKey",
  EmailKey = "EmailKey",
  PhoneKeyRequest = "PhoneKeyRequest",
  PhoneKeyConfirm = "PhoneKeyConfirm",
  SocialKey = "SocialKey",
  NfcKey = "NfcKey",
  CloudKey = "CloudKey",
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
  serializedData?: Serialized<MultisigWallet>["data"];
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
  [KeyRoute.NfcKey]: CommonKeyParams & {
    targetPublicKey?: string;
  };
  [KeyRoute.CloudKey]: CommonKeyParams & {
    targetPublicKey?: string;
  };
}
