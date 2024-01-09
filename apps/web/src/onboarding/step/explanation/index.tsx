"use client";

import { Text } from "@/components";
import { ExplanationOnboardingStep } from "@/onboarding";
import { OnboardingButtons } from "@/onboarding/onboarding-buttons";
import { StepProps } from "@/onboarding/step";
import { observer } from "mobx-react-lite";
import Image from "next/image";

export const ExplanationStep = observer(function ExplanationStep({
  back,
  next,
}: StepProps<ExplanationOnboardingStep>) {
  return (
    <>
      <Text fontWeight="bold" size="3xl">
        Secure Your Account
      </Text>
      <Text
        className="w-96 text-center"
        fontWeight="medium"
        leading="tight"
        color="zinc"
      >
        Keys give access to your account. Like multi-factor authentication,
        creating multiple keys enhances the security of your account.
      </Text>
      <Image
        width="262"
        height="262"
        src="/assets/images/dall.png"
        alt="Icon"
      />
      <Text
        className="w-96 text-center"
        fontWeight="medium"
        leading="tight"
        color="zinc"
      >
        Additional key types also serve as a safety measure to recover your
        assets in the circumstance that you lose access to one or more of your
        keys.
      </Text>

      <OnboardingButtons
        back={back}
        next={() => {
          if (next) next();
        }}
        nextLabel="Create My First Key"
      />
    </>
  );
});
