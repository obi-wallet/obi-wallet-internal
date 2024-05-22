"use client";

import { Text } from "@/components";
import { OnboardingButtons } from "@/onboarding/onboarding-buttons";
import { ExplanationOnboardingStep } from "@/onboarding/onboarding-step";
import { StepProps } from "@/onboarding/step";
import { observer } from "mobx-react-lite";
import Image from "next/image";

export const ExplanationStep = observer(function ExplanationStep({
  back,
  next,
}: StepProps<ExplanationOnboardingStep>) {
  return (
    <>
      <Text fontWeight="bold" size="3xl" className="font-PressStart2P">
        Secure Your Account
      </Text>
      <Text
        className="w-96 text-center"
        fontWeight="medium"
        leading="tight"
        color="zinc"
      >
        Create the first key to secure your account. You can add more keys later
        to increase security and recoverability.
      </Text>
      <Image
        width="262"
        height="262"
        src="/assets/images/dall.png"
        alt="Icon"
      />

      <OnboardingButtons
        back={() => {
          if (back) back();
        }}
        next={() => {
          if (next) next();
        }}
      />
    </>
  );
});
