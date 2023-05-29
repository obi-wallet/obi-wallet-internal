import { MultisigWallet, Serialized } from "@obi-wallet/sdk";

import { KeyFlow } from "./key-stack";

export enum OnboardingRoute {
  Welcome = "Welcome",
  CreateWallet = "CreateWallet",
  RecoverWallet = "RecoverWallet",
  LookupProxyWallets = "LookupProxyWallets",
  SelectRecoveryMethod = "SelectRecoveryMethod",
  EmailRecovery = "EmailRecovery",
}

export enum RecoverFrom {
  Email = "Email",
  Phone = "Phone",
}

interface CommonOnboardingParams {
  flow: KeyFlow;
  draftId: string;
  demoMode: boolean;
}

export interface OnboardingStackParamList
  extends Record<string, object | undefined> {
  [OnboardingRoute.Welcome]: undefined;
  [OnboardingRoute.SelectRecoveryMethod]: CommonOnboardingParams;
  [OnboardingRoute.CreateWallet]: CommonOnboardingParams;
  [OnboardingRoute.RecoverWallet]: CommonOnboardingParams & {
    serializedData?: Serialized<MultisigWallet>["data"];
  };
  [OnboardingRoute.LookupProxyWallets]: CommonOnboardingParams & {
    recoverFrom: RecoverFrom;
  };
  [OnboardingRoute.EmailRecovery]: CommonOnboardingParams;
}
