import { MultisigWallet, Serialized } from "@obi-wallet/sdk";

import { KeyFlow } from "./key-stack";
import { SerializedProxyWallet } from "../components/screens/lookup-proxy-wallets/api-types";

export enum OnboardingRoute {
  Welcome = "Welcome",
  CreateWallet = "CreateWallet",
  RecoverWallet = "RecoverWallet",
  LookupProxyWallets = "LookupProxyWallets",
  SelectRecoveryMethod = "SelectRecoveryMethod",
  EmailRecovery = "EmailRecovery",
}

export enum RecoverFrom {
  Device = "Device",
  Email = "Email",
  Phone = "Phone",
  Unity = "Unity",
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
    walletsFound: SerializedProxyWallet[];
  };
  [OnboardingRoute.EmailRecovery]: CommonOnboardingParams;
}
