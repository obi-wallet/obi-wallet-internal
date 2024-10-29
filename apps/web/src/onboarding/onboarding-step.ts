export enum OnboardingFromType {
  Internal,
  External,
}
export enum OnboardingStepType {
  UserData,
  PrimaryKey,
  FastTravel,
  CreateWallet,
}

export interface UserDataOnboardingStep {
  type: OnboardingStepType.UserData;
}

export interface PrimaryKeyOnboardingStep {
  type: OnboardingStepType.PrimaryKey;
  demoMode?: boolean;
  from?: OnboardingFromType;
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
  | PrimaryKeyOnboardingStep
  | CreateWalletOnboardingStep
  | FastTravelOnboardingStep;
