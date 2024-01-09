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

  const currentStep = steps[draft.value.currentStep];

  if (!currentStep) return null;

  return (
    <section className="flex flex-col items-center space-y-7">
      <Stepper
        currentStep={draft.value.currentStep}
        totalSteps={steps.length}
      />
      <Step draft={draft} step={currentStep} />
    </section>
  );
});
