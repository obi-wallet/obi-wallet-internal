import { Draft } from "@/stores";
import { observer } from "mobx-react-lite";

import { OnboardingPayload } from "../onboarding-payload";
import { OnboardingStep, OnboardingStepType } from "../onboarding-step";

export interface StepProps {
  draft: Draft<OnboardingPayload>;
  step: OnboardingStep;
}

export const Step = observer(function Step(props: StepProps) {
  switch (props.step.type) {
    case OnboardingStepType.UserData:
      break;
    case OnboardingStepType.Explanation:
      break;
    case OnboardingStepType.PrimaryKey:
      break;
    case OnboardingStepType.MultisigSettings:
      break;
    case OnboardingStepType.Congratulations:
      break;
    case OnboardingStepType.FastTravel:
      break;
  }

  return null;
});
