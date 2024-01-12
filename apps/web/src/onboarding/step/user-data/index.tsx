"use client";

import { Dropzone, ImageDropzone, Input, Text } from "@/components";
import { UserDataOnboardingStep } from "@/onboarding";
import { OnboardingButtons } from "@/onboarding/onboarding-buttons";
import { StepProps } from "@/onboarding/step";
import { observer } from "mobx-react-lite";
import { ChangeEvent } from "react";
import invariant from "tiny-invariant";

export const UserDataStep = observer(function UserDataStep({
  draft,
  back,
  next,
}: StepProps<UserDataOnboardingStep>) {
  return (
    <>
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
        className="w-96"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          draft.value.setName(e.target.value);
        }}
        value={draft.value.name}
        placeholder="Name"
      />

      <ImageDropzone
        placeholder="Upload Picture"
        onChange={(_, fileBody) => {
          console.log({ fileBody });
          draft.value.setImage(fileBody);
        }}
      />

      <OnboardingButtons
        back={back}
        next={next}
        nextLabel="Continue"
        nextDisabled={!draft.value.name || !draft.value.image}
      />
    </>
  );
});
