import { NewOnboardingPayload } from "@/onboarding/new-onboarding-payload";
import {
  OnboardingFromType,
  OnboardingStep,
  OnboardingStepType,
} from "@/onboarding/onboarding-step";
import { CreateWalletStep } from "@/onboarding/step/create-wallet";
import { ExplanationStep } from "@/onboarding/step/explanation";
import { PrimaryKeyStep } from "@/onboarding/step/primary-key";
import { UserDataStep } from "@/onboarding/step/user-data";
import { Draft } from "@/stores";
import { observer } from "mobx-react-lite";

export interface StepProps<Step = OnboardingStep> {
  draft: Draft<NewOnboardingPayload>;
  step: Step;
  back?: () => void;
  next?: () => void;
  from?: OnboardingFromType;
}

export const Step = observer(function Step(props: StepProps) {
  switch (props.step.type) {
    case OnboardingStepType.UserData:
      return <UserDataStep {...props} step={props.step} />;
    case OnboardingStepType.Explanation:
      return <ExplanationStep {...props} step={props.step} />;
    case OnboardingStepType.PrimaryKey:
      return <PrimaryKeyStep {...props} step={props.step} />;
    case OnboardingStepType.CreateWallet:
      return <CreateWalletStep {...props} step={props.step} />;
  }

  return null;
});
