"use client";

import { Stepper } from "@/components";
import { observer } from "mobx-react-lite";

import { OnboardingStep } from "./onboarding-step";
import { Step } from "./step";
import { useOnboardingDraft } from "./use-onboarding-draft";

export * from "./onboarding-step";

export interface OnboardingProps {
  draftId: string;
  steps: OnboardingStep[];
}

export const Onboarding = observer(function Onboarding({
  draftId,
  steps,
}: OnboardingProps) {
  const draft = useOnboardingDraft({ draftId });

  if (!draft) return null;

  // Minus 1 because currentStep is 1-based, but the array is 0-based.
  const currentStep = steps[draft.value.currentStep - 1];

  if (!currentStep) return null;

  const back =
    draft.value.currentStep > 1
      ? () => {
          draft.value.setCurrentStep(draft.value.currentStep - 1);
        }
      : undefined;
  const next =
    draft.value.currentStep < steps.length
      ? () => {
          draft.value.setCurrentStep(draft.value.currentStep + 1);
        }
      : undefined;

  return (
    <section className="flex flex-col items-center space-y-7">
      <Stepper
        currentStep={draft.value.currentStep}
        totalSteps={steps.length}
      />
      <Step draft={draft} step={currentStep} back={back} next={next} />
    </section>
  );
});
