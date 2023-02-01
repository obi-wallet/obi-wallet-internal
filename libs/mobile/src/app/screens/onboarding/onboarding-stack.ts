export enum OnboardingRoute {
  Welcome = "Welcome",
  CreateWallet = "CreateWallet",
  CreateMultisigBiometrics = "CreateMultisigBiometrics",
  CreateMultisigPhoneNumber = "CreateMultisigPhoneNumber",
  CreateMultisigPhoneNumberConfirm = "CreateMultisigPhoneNumberConfirm",
  ReplaceMultisig = "ReplaceMultisig",
  RecoverMultisig = "RecoverMultisig",
  LookupProxyWallets = "LookupProxyWallets",
}

export interface OnboardingStackParamList
  extends Record<string, object | undefined> {
  [OnboardingRoute.Welcome]: undefined;
  [OnboardingRoute.CreateWallet]: {
    draftId: string;
    demoMode: boolean;
  };
  [OnboardingRoute.CreateMultisigBiometrics]: undefined;
  [OnboardingRoute.CreateMultisigPhoneNumber]: undefined;
  [OnboardingRoute.CreateMultisigPhoneNumberConfirm]: {
    phoneNumber: string;
    securityQuestion: string;
    securityAnswer: string;
  };
  [OnboardingRoute.ReplaceMultisig]: undefined;
  [OnboardingRoute.RecoverMultisig]: undefined;
  [OnboardingRoute.LookupProxyWallets]: undefined;
}
