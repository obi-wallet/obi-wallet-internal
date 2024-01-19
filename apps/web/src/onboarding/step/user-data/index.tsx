"use client";

import { ImageDropzone, Input, Text } from "@/components";
import { OnboardingButtons } from "@/onboarding/onboarding-buttons";
import { UserDataOnboardingStep } from "@/onboarding/onboarding-step";
import { StepProps } from "@/onboarding/step";
import { observer } from "mobx-react-lite";
import { ChangeEvent, useEffect, useState } from "react";

export const UserDataStep = observer(function UserDataStep({
  draft,
  back,
  next,
}: StepProps<UserDataOnboardingStep>) {
  const [defaultImageFile, setDefaultImageFile] = useState<File>();

  useEffect(() => {
    const loadDefaults = async () => {
      try {
        const response = await fetch("/assets/images/default-avatar.png");
        const blob = await response.blob();
        const file = new File([blob], "defaultImage.png", {
          type: "image/png",
        });
        setDefaultImageFile(file);

        draft.value.setName("My OBI Wallet");
      } catch (error) {
        console.error("Error loading image:", error);
      }
    };

    loadDefaults();
  }, []);

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
        labelBgColor="bg-slate-950"
      />

      <ImageDropzone
        placeholder="Upload Picture"
        onChange={(_, fileBody) => {
          draft.value.setImage(fileBody);
        }}
        defaultImageFile={defaultImageFile}
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
