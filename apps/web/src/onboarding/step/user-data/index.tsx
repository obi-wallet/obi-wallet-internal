"use client";

import { Dropzone, Input, Text } from "@/components";
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

      <Dropzone
        className="mt-8"
        placeholder="Upload Picture"
        onChange={(files) => {
          const reader = new FileReader();
          reader.addEventListener("load", () => {
            invariant(
              typeof reader.result === "string",
              "Expected reader result to be base64 string",
            );
            draft.value.setImage(reader.result);
          });

          const file = files[0];
          if (file) {
            reader.readAsDataURL(file);
          }
        }}
      />

      {draft.value.image ? (
        <img src={draft.value.image} className="w-96 rounded-full" />
      ) : null}

      <OnboardingButtons
        back={back}
        next={next}
        nextLabel="Continue"
        nextDisabled={!draft.value.name || !draft.value.image}
      />
    </>
  );
});
