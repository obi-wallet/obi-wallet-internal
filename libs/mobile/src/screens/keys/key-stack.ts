import { KeyType, MultisigWallet, Serialized } from "@obi-wallet/sdk";
import { ParamListBase } from "@react-navigation/native";

import {
  OnboardingRoute,
  RecoverFrom,
} from "../../app/screens/onboarding/onboarding-stack";

export enum KeyRoute {
  DeviceKey = "DeviceKey",
  EmailKey = "EmailKey",
  PhoneKeyRequest = "PhoneKeyRequest",
  PhoneKeyConfirm = "PhoneKeyConfirm",
  SocialKey = "SocialKey",
  NfcKey = "NfcKey",
  CloudKey = "CloudKey",
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
  }
}

export function keyTypeToKeyRoute(type: KeyType) {
  switch (type) {
    case KeyType.Device:
      return KeyRoute.DeviceKey;
    case KeyType.Email:
      return KeyRoute.EmailKey;
    case KeyType.Phone:
      return KeyRoute.PhoneKeyRequest;
    case KeyType.Social:
      return KeyRoute.SocialKey;
    case KeyType.Nfc:
      return KeyRoute.NfcKey;
    case KeyType.Cloud:
      return KeyRoute.CloudKey;
    case KeyType.EmailRecovery:
      return OnboardingRoute.EmailRecovery;
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
  [KeyRoute.EmailKey]: CommonKeyParams & {
    RecoverFrom?: RecoverFrom.Email | RecoverFrom.Phone;
  };
  [KeyRoute.PhoneKeyRequest]: CommonKeyParams & {
    RecoverFrom?: RecoverFrom.Email | RecoverFrom.Phone;
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
}
