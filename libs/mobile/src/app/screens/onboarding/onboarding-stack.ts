export enum OnboardingRoute {
  Welcome = "Welcome",
  CreateWallet = "CreateWallet",
  LookupProxyWallets = "LookupProxyWallets",
}

export interface OnboardingStackParamList
  extends Record<string, object | undefined> {
  [OnboardingRoute.Welcome]: undefined;
  [OnboardingRoute.CreateWallet]: {
    draftId: string;
    demoMode: boolean;
  };
  [OnboardingRoute.LookupProxyWallets]: {
    draftId: string;
    demoMode: boolean;
  };
}
