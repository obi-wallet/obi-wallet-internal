"use client";

import { Onboarding, OnboardingStepType } from "@/onboarding";
import { observer } from "mobx-react-lite";

export default observer(function InternalOnboarding() {
  const steps = [
    {
      type: OnboardingStepType.UserData,
    },
    {
      type: OnboardingStepType.Explanation,
    },
    {
      type: OnboardingStepType.PrimaryKey,
    },
    {
      type: OnboardingStepType.Congratulations,
    },
  ];

  return <Onboarding draftId="internal-onboarding" steps={steps} />;
});
