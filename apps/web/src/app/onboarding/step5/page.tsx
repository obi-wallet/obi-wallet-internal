"use client";
import Typography from "@/components/Typography";
import Stepper from "@/components/Stepper";
import Button from "@/components/buttons/Button";

import ButtonLink from "@/components/links/ButtonLink";
import Image from "next/image";

export default function Step3() {
  return (
    <section className="flex flex-col items-center space-y-7">
      <Stepper currentStep={5} />
      <Typography fontWeight="bold" size="3xl">
        Congratulations 🎉
      </Typography>
      <Typography
        className="w-96 text-center"
        fontWeight="medium"
        leading="tight"
        color="zinc"
      >
        As one of our first 10,000 users, you’ve been awarded a special Obi NFT.
      </Typography>
      <Image
        width="310"
        height="310"
        src="/assets/images/NFT.png"
        alt="NFT"
        className="rounded-2xl"
      />
      <div className="grid w-full grid-cols-2 gap-6">
        <ButtonLink
          href="/onboarding/step4"
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
}
