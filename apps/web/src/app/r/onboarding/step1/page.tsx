"use client";

import { ButtonLink, Dropzone, Input, Stepper, Text } from "@/components";
import { useOnboardingDraft } from "@/onboarding/use-onboarding-draft";
import { observer } from "mobx-react-lite";
import { ChangeEvent } from "react";

export default observer(function Step1() {
  const draft = useOnboardingDraft({ draftId: "onboarding" });

  if (!draft) return null;

  return (
    <section className="flex flex-col items-center space-y-7">
      <Stepper currentStep={1} totalSteps={5} />
      <Text fontWeight="bold" size="3xl">
        Name Your Account
      </Text>
      <Text
        className="w-96 text-center"
        fontWeight="medium"
        leading="tight"
        color="zinc"
      >
        Start by naming your account and uploading a profile picture associated
        with it.
      </Text>
      <Input
        onChange={(_e: ChangeEvent<HTMLInputElement>) => {
          // draft.value.setName(e.target.value);
        }}
        placeholder="Name"
        value={draft.value.userData?.name ?? ""}
      />
      <Dropzone
        className="mt-8"
        placeholder="Upload an Image"
        onChange={() => {}}
      />
      <ButtonLink
        href="/r/onboarding/step2"
        className="block w-full"
        variant="primary"
      >
        Continue
      </ButtonLink>
    </section>
  );
});
