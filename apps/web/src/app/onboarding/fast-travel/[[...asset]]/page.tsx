"use client";

import { Stepper, TravelModal } from "@/components";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";

export default observer<{ params: { asset?: string[] } }>(function FastTravel({
  params,
}) {
  const router = useRouter();

  return (
    <section className="flex flex-col items-center space-y-7">
      <Stepper currentStep={2} totalSteps={2} />
      <TravelModal
        targetAsset={params.asset?.[0] ?? "sei"}
        modal={false}
        onDismiss={() => {
          router.push("/dashboard");
        }}
      />
    </section>
  );
});
