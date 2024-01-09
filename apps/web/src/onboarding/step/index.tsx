import { OnboardingStep, OnboardingStepType } from "@/onboarding";
import { OnboardingPayload } from "@/onboarding/onboarding-payload";
import { CongratulationsStep } from "@/onboarding/step/congratulations";
import { ExplanationStep } from "@/onboarding/step/explanation";
import { MultisigSettingsStep } from "@/onboarding/step/multisig-settings";
import { PrimaryKeyStep } from "@/onboarding/step/primary-key";
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
      return <ExplanationStep {...props} step={props.step} />;
    case OnboardingStepType.PrimaryKey:
      return <PrimaryKeyStep {...props} step={props.step} />;
    case OnboardingStepType.MultisigSettings:
      return <MultisigSettingsStep {...props} step={props.step} />;
    case OnboardingStepType.Congratulations:
      return <CongratulationsStep {...props} step={props.step} />;
    case OnboardingStepType.FastTravel:
      break;
  }

  return null;
});
