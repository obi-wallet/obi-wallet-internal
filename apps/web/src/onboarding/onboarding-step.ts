export enum OnboardingStepType {
  UserData,
  Explanation,
  PrimaryKey,
  MultisigSettings,
  Congratulations,
  FastTravel,
}

export interface UserDataOnboardingStep {
  type: OnboardingStepType.UserData;
}

export interface ExplanationOnboardingStep {
  type: OnboardingStepType.Explanation;
}

export interface PrimaryKeyOnboardingStep {
  type: OnboardingStepType.PrimaryKey;
}

export interface MultisigSettingsOnboardingStep {
  type: OnboardingStepType.MultisigSettings;
}

export interface CongratulationsOnboardingStep {
  type: OnboardingStepType.Congratulations;
}

export interface FastTravelOnboardingStep {
  type: OnboardingStepType.FastTravel;
}

export type OnboardingStep =
  | UserDataOnboardingStep
  | ExplanationOnboardingStep
  | PrimaryKeyOnboardingStep
  | MultisigSettingsOnboardingStep
  | CongratulationsOnboardingStep
  | FastTravelOnboardingStep;
