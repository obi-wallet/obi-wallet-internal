export enum OnboardingStepType {
  UserData,
  Explanation,
  PrimaryKey,
  FastTravel,
  CreateWallet,
}

export interface UserDataOnboardingStep {
  type: OnboardingStepType.UserData;
}

export interface ExplanationOnboardingStep {
  type: OnboardingStepType.Explanation;
}

export interface PrimaryKeyOnboardingStep {
  type: OnboardingStepType.PrimaryKey;
  demoMode?: boolean;
}

export interface CreateWalletOnboardingStep {
  type: OnboardingStepType.CreateWallet;
  demoMode?: boolean;
  waitUntilDone: boolean;
  redirectTo: string;
}

export interface FastTravelOnboardingStep {
  type: OnboardingStepType.FastTravel;
}

export type OnboardingStep =
  | UserDataOnboardingStep
  | ExplanationOnboardingStep
  | PrimaryKeyOnboardingStep
  | CreateWalletOnboardingStep
  | FastTravelOnboardingStep;
