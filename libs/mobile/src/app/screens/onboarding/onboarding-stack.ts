export enum OnboardingRoute {
  Welcome = "Welcome",
  CreateWallet = "CreateWallet",
  CreateMultisigBiometrics = "CreateMultisigBiometrics",
  CreateMultisigPhoneNumber = "CreateMultisigPhoneNumber",
  CreateMultisigPhoneNumberConfirm = "CreateMultisigPhoneNumberConfirm",
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
  [OnboardingRoute.CreateMultisigSocial]: undefined;
  [OnboardingRoute.CreateMultisigInit]: undefined;
  [OnboardingRoute.ReplaceMultisig]: undefined;
  [OnboardingRoute.RecoverMultisig]: undefined;
  [OnboardingRoute.RecoverSinglesig]: undefined;
  [OnboardingRoute.LookupProxyWallets]: undefined;
}
