export enum OnboardingRoute {
  Welcome = "Welcome",
  CreateMultisigBiometrics = "CreateMultisigBiometrics",
  CreateMultisigPhoneNumber = "CreateMultisigPhoneNumber",
  CreateMultisigPhoneNumberConfirm = "CreateMultisigPhoneNumberConfirm",
  CreateMultisigNFC = "CreateMultisigNFC",
  CreateMultisigSocial = "CreateMultisigSocial",
  CreateMultisigInit = "CreateMultisigInit",
  ReplaceMultisig = "ReplaceMultisig",
  RecoverMultisig = "RecoverMultisig",
  RecoverSinglesig = "RecoverSinglesig",
  LookupProxyWallets = "LookupProxyWallets",
}

export interface OnboardingStackParamList
  extends Record<string, object | undefined> {
  [OnboardingRoute.Welcome]: undefined;
  [OnboardingRoute.CreateMultisigBiometrics]: undefined;
  [OnboardingRoute.CreateMultisigPhoneNumber]: undefined;
  [OnboardingRoute.CreateMultisigPhoneNumberConfirm]: {
    phoneNumber: string;
    securityQuestion: string;
    securityAnswer: string;
  };
  [OnboardingRoute.CreateMultisigNFC]: undefined;
  [OnboardingRoute.CreateMultisigSocial]: undefined;
  [OnboardingRoute.CreateMultisigInit]: undefined;
  [OnboardingRoute.ReplaceMultisig]: undefined;
  [OnboardingRoute.RecoverMultisig]: undefined;
  [OnboardingRoute.RecoverSinglesig]: undefined;
  [OnboardingRoute.LookupProxyWallets]: undefined;
}
