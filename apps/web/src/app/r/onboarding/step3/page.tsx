"use client";

import { ButtonLink, Stepper, Text } from "@/components";
import { useOnboardingDraft } from "@/onboarding/use-onboarding-draft";
import { observer } from "mobx-react-lite";
import { FaApple, FaGoogle, FaWindows } from "react-icons/fa";

export default observer(function Step3() {
  const draft = useOnboardingDraft({ draftId: "onboarding" });

  if (!draft) return null;

  return (
    <section className="flex flex-col items-center space-y-7">
      <Stepper currentStep={3} totalSteps={5} />
      <Text fontWeight="bold" size="3xl">
        Create Your First Key
      </Text>
      <Text
        className="w-96 text-center"
        fontWeight="medium"
        leading="tight"
        color="zinc"
      >
        Sign in with one of the services below to create your first key.
      </Text>

      <ButtonLink
        href="/r/onboarding/passkey"
        className="block w-full"
        variant="primary"
      >
        <div>Passkey</div>
        <div>(Recommended)</div>
      </ButtonLink>

      <div className="flex w-full items-center">
        <div className="h-0.5 w-full rounded-lg bg-gray-600" />
        <Text className="grow-0 px-3" color="gray">
          OR
        </Text>
        <div className="h-0.5 w-full rounded-lg bg-gray-600" />
      </div>

      <div className="flex w-full flex-row justify-around">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
          <FaApple className="h-9 w-9 text-white" />
        </div>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
          <FaGoogle className="h-7 w-7 text-white" />
        </div>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
          <FaWindows className="h-7 w-7 text-white" />
        </div>
      </div>

      <div className="grid w-full grid-cols-2 gap-6">
        <ButtonLink
          href="/r/onboarding/step2"
          className="block w-full"
          variant="outline"
        >
          Back
        </ButtonLink>
        <ButtonLink
          href="/r/onboarding/step4"
          className="block w-full"
          variant="primary"
        >
          Confirm
        </ButtonLink>
      </div>
    </section>
  );
});
