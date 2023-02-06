import { MultisigWalletSerializedData } from "@obi-wallet/common";

export enum OnboardingRoute {
  Welcome = "Welcome",
  CreateWallet = "CreateWallet",
  RecoverWallet = "RecoverWallet",
  LookupProxyWallets = "LookupProxyWallets",
}

export interface OnboardingStackParamList
  extends Record<string, object | undefined> {
  [OnboardingRoute.Welcome]: undefined;
  [OnboardingRoute.CreateWallet]: {
    draftId: string;
    demoMode: boolean;
  };
  [OnboardingRoute.RecoverWallet]: {
    draftId: string;
    demoMode: boolean;
    serializedData?: MultisigWalletSerializedData.SerializedMultisigWalletData;
  };
  [OnboardingRoute.LookupProxyWallets]: {
    draftId: string;
    demoMode: boolean;
  };
}
