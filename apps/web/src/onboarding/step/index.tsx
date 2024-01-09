import { OnboardingStep, OnboardingStepType } from "@/onboarding";
import { OnboardingPayload } from "@/onboarding/onboarding-payload";
import { UserDataStep } from "@/onboarding/step/user-data";
import { Draft } from "@/stores";
import { observer } from "mobx-react-lite";

export interface StepProps<Step = OnboardingStep> {
  draft: Draft<OnboardingPayload>;
  step: Step;
  back?: () => void;
  next?: () => void;
}

export const Step = observer(function Step(props: StepProps) {
  switch (props.step.type) {
    case OnboardingStepType.UserData:
      return <UserDataStep {...props} step={props.step} />;
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
