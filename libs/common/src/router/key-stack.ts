import { KeyType, MultisigWallet, Serialized } from "@obi-wallet/sdk";
import { ParamListBase } from "@react-navigation/native";

import { OnboardingRoute } from "./onboarding-stack";

export enum KeyRoute {
  DeviceKey = "DeviceKey",
  EmailKey = "EmailKey",
  PhoneKeyRequest = "PhoneKeyRequest",
  PhoneKeyConfirm = "PhoneKeyConfirm",
  SocialKey = "SocialKey",
  NfcKey = "NfcKey",
  CloudKey = "CloudKey",
  ZAuthKey = "ZAuthKey",
}

export function keyRouteToKeyType(route: KeyRoute) {
  switch (route) {
    case KeyRoute.DeviceKey:
      return KeyType.Device;
    case KeyRoute.EmailKey:
      return KeyType.Email;
    case KeyRoute.PhoneKeyRequest:
      return KeyType.Phone;
    case KeyRoute.PhoneKeyConfirm:
      return KeyType.Phone;
    case KeyRoute.SocialKey:
      return KeyType.Social;
    case KeyRoute.NfcKey:
      return KeyType.Nfc;
    case KeyRoute.CloudKey:
      return KeyType.Cloud;
    case KeyRoute.ZAuthKey:
      return KeyType.ZAuth;
  }
}

export function keyTypeToKeyRoute(type: KeyType) {
  switch (type) {
    case KeyType.Cloud:
      return KeyRoute.CloudKey;
    case KeyType.Device:
      return KeyRoute.DeviceKey;
    case KeyType.Email:
      return KeyRoute.EmailKey;
    case KeyType.EmailRecovery:
      return OnboardingRoute.EmailRecovery;
    case KeyType.Nfc:
      return KeyRoute.NfcKey;
    case KeyType.Phone:
      return KeyRoute.PhoneKeyRequest;
    case KeyType.Social:
      return KeyRoute.SocialKey;
    /// TODO: for now Unity uses device key screen
    case KeyType.Unity:
      return KeyRoute.DeviceKey;
    case KeyType.ZAuth:
      return KeyRoute.ZAuthKey;
  }
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
  [KeyRoute.PhoneKeyRequest]: CommonKeyParams & {
    phoneNumber?: string;
  };
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
  [KeyRoute.ZAuthKey]: CommonKeyParams;
}
