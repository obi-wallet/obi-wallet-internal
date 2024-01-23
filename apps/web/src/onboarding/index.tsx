"use client";

import { Stepper } from "@/components";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";

import { OnboardingStep } from "./onboarding-step";
import { Step } from "./step";
import { useOnboardingDraft } from "./use-onboarding-draft";

export interface OnboardingProps {
  draftId: string;
  steps: Readonly<OnboardingStep[]>;
  step: number;
}

export const Onboarding = observer(function Onboarding({
  draftId,
  steps,
  step,
}: OnboardingProps) {
  const draft = useOnboardingDraft({ draftId });
  const router = useRouter();

  if (!draft) return null;

  const currentStep = steps[step];
  if (!currentStep) return null;

  console.log({ currentStep });
  const back = step > 0 ? () => router.push(`${step - 1}`) : undefined;
  const next =
    step + 1 < steps.length ? () => router.push(`${step + 1}`) : undefined;

  return (
    <section className="flex flex-col items-center space-y-7">
      <Stepper currentStep={step + 1} totalSteps={steps.length} />
      <Step draft={draft} step={currentStep} back={back} next={next} />
    </section>
  );
});
