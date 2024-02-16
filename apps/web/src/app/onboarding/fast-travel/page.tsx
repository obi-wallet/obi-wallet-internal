"use client";

import { Stepper, TravelModal } from "@/components";
import { useRouter } from "next/navigation";

export default function Congratulations() {
  const router = useRouter();

  return (
    <section className="flex flex-col items-center space-y-7">
      <Stepper currentStep={2} totalSteps={2} />
      <TravelModal
        targetAsset="sei"
        modal={false}
        onDismiss={() => {
          router.push("/dashboard");
        }}
      />
    </section>
  );
}
