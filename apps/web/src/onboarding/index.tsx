"use client";

import { Stepper } from "@/components";
import { OnboardingStep } from "@/onboarding/onboarding-step";
import { useOnboardingDraft } from "@/onboarding/use-onboarding-draft";
import { observer } from "mobx-react-lite";

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

  return (
    <section className="flex flex-col items-center space-y-7">
      <Stepper currentStep={1} totalSteps={steps.length} />
    </section>
  );
});
