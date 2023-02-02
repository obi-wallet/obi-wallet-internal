export enum OnboardingRoute {
  Welcome = "Welcome",
  CreateWallet = "CreateWallet",
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
  [OnboardingRoute.RecoverMultisig]: undefined;
  [OnboardingRoute.LookupProxyWallets]: undefined;
}
