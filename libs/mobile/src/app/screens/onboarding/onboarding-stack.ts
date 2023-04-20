import { MultisigWallet, Serialized } from "@obi-wallet/sdk";

import { KeyFlow } from "../../../screens/keys";

export enum OnboardingRoute {
  Welcome = "Welcome",
  CreateWallet = "CreateWallet",
  RecoverWallet = "RecoverWallet",
  LookupProxyWallets = "LookupProxyWallets",
  SelectMethod = "SelectMethod",
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
  [OnboardingRoute.SelectMethod]: CommonOnboardingParams;
  [OnboardingRoute.Welcome]: undefined;
  [OnboardingRoute.CreateWallet]: CommonOnboardingParams;
  [OnboardingRoute.RecoverWallet]: CommonOnboardingParams & {
    serializedData?: Serialized<MultisigWallet>["data"];
  };
  [OnboardingRoute.LookupProxyWallets]: CommonOnboardingParams & {
    RecoverFrom: RecoverFrom;
    flow: KeyFlow;
  };
  [OnboardingRoute.EmailRecovery]: CommonOnboardingParams;
}
