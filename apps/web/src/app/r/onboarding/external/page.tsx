"use client";

import { Onboarding, OnboardingStepType } from "@/onboarding";
import { observer } from "mobx-react-lite";

export default observer(function ExternalOnboarding() {
  const steps = [
    {
      type: OnboardingStepType.PrimaryKey,
    },
    {
      type: OnboardingStepType.FastTravel,
    },
  ];

  return <Onboarding steps={steps} />;
});
