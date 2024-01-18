"use client";

import { Stepper, Text } from "@/components";

export default function Congratulations() {
  return (
    <section className="flex flex-col items-center space-y-7">
      <Stepper currentStep={2} totalSteps={2} />
      <Text fontWeight="bold" size="3xl">
        Fast Travel
      </Text>
    </section>
  );
}
