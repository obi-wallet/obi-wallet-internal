"use client";

import { Button, ButtonLink, Stepper, Text } from "@/components";
import { useOnboardingDraft } from "@/onboarding/use-onboarding-draft";
import { observer } from "mobx-react-lite";
import Image from "next/image";

export default observer(function Step5() {
  const draft = useOnboardingDraft({ draftId: "onboarding" });

  if (!draft) return null;

  return (
    <section className="flex flex-col items-center space-y-7">
      <Stepper currentStep={5} totalSteps={5} />
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
        src="/assets/images/NFT.png"
        alt="NFT"
        className="rounded-2xl"
      />
      <div className="grid w-full grid-cols-2 gap-6">
        <ButtonLink
          href="/r/onboarding/step4"
          className="block w-full"
          variant="outline"
        >
          Back
        </ButtonLink>
        <Button className="block w-full" variant="primary">
          Go To Wallet
        </Button>
      </div>
    </section>
  );
});
