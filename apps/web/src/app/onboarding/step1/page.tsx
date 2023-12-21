"use client";

import { ButtonLink, Dropzone, Input, Stepper, Text } from "@/components";
import { ChangeEvent } from "react";

export default function Step1() {
  return (
    <section className="flex flex-col items-center space-y-7">
      <Stepper />
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
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          console.log(e.target.value);
        }}
        placeholder="Name"
      />
      <Dropzone className="mt-8" />
      <ButtonLink
        href="/onboarding/step2"
        className="block w-full"
        variant="primary"
      >
        Continue
      </ButtonLink>
    </section>
  );
}
