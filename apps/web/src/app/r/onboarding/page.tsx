"use client";

import { ButtonLink, Text } from "@/components";
import { useOnboardingDraft } from "@/onboarding/use-onboarding-draft";
import { observer } from "mobx-react-lite";
import Image from "next/image";

export default observer(function Onboarding() {
  useOnboardingDraft();

  return (
    <section className="flex w-full flex-col items-center justify-center space-y-9">
      <Text className="text-2xl" leading="normal" fontWeight="bold">
        What is an Obi Account?
      </Text>
      <Image
        width="151"
        height="268"
        src="/assets/images/Obi Wizard.png"
        alt="Icon"
      />
      <div className=" w-[440px] space-y-9">
        <Text
          className="text-center text-base "
          color="zinc"
          fontWeight="medium"
          leading="tight"
        >
          Obi Smart Accounts are a convenient and secure way to custody your
          crypto assets without the risk and hassle of seed phrases or private
          keys.
        </Text>
        <ButtonLink
          href="/r/onboarding/step1"
          className="block w-full"
          variant="primary"
        >
          Get Started
        </ButtonLink>
      </div>
    </section>
  );
});
