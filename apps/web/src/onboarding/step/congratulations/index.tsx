"use client";

import { Text } from "@/components";
import { CongratulationsOnboardingStep } from "@/onboarding";
import { OnboardingButtons } from "@/onboarding/onboarding-buttons";
import { StepProps } from "@/onboarding/step";
import { observer } from "mobx-react-lite";
import Image from "next/image";

export const CongratulationsStep = observer(function CongratulationsStep({
  back,
  next,
}: StepProps<CongratulationsOnboardingStep>) {
  return (
    <>
      <Text fontWeight="bold" size="3xl">
        Congratulations 🎉
      </Text>
      <Text
        className="w-96 text-center"
        fontWeight="medium"
        leading="tight"
        color="zinc"
      >
        As one of our first 10,000 users, you’ve been awarded a special Obi NFT.
      </Text>
      <Image
        width="310"
        height="310"
        src="/assets/images/nft.png"
        alt="NFT"
        className="rounded-2xl"
      />

      <OnboardingButtons back={back} next={next} nextLabel="Go To Wallet" />
    </>
  );
});
