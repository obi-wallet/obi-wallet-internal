"use client";

import { Dropzone, Input, Text } from "@/components";
import { UserDataOnboardingStep } from "@/onboarding";
import { OnboardingButtons } from "@/onboarding/onboarding-buttons";
import { StepProps } from "@/onboarding/step";
import { observer } from "mobx-react-lite";
import { ChangeEvent, useState } from "react";
import invariant from "tiny-invariant";

export const UserDataStep = observer(function UserDataStep({
  draft,
  back,
  next,
}: StepProps<UserDataOnboardingStep>) {
  const [name, setName] = useState("");
  const [image, setImage] = useState("");

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
          setName(e.target.value);
        }}
        value={name}
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
            setImage(reader.result);
          });

          const file = files[0];
          if (file) {
            reader.readAsDataURL(file);
          }
        }}
      />

      {image && <img src={image} className="w-96 rounded-full" />}

      <OnboardingButtons
        back={back}
        next={() => {
          draft.value.setUserData({
            name,
            image,
          });
          if (next) next();
        }}
        nextLabel="Continue"
        nextDisabled={!name || !image}
      />
    </>
  );
});
