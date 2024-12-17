"use client";

import { Button, Text } from "@/components";
import Image from "next/image";

export default function Congratulations() {
  return (
    <section className="flex flex-col items-center space-y-7">
      {/* <Stepper currentStep={4} totalSteps={4} /> */}
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

      <Button href="/dashboard" className="block w-full" variant="primary">
        Go To Wallet
      </Button>
    </section>
  );
}
