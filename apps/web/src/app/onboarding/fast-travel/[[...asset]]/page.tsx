"use client";

import { Stepper, TravelModal } from "@/components";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";

export default observer<{ params: { asset?: string[] } }>(function FastTravel({
  params,
}) {
  const targetAsset = params.asset?.[0] ?? "sei";
  useCurrentWallet({
    redirectTo: `/onboarding/external-${targetAsset}`,
  });
  const router = useRouter();

  return (
    <section className="flex flex-col items-center space-y-7">
      <Stepper currentStep={2} totalSteps={2} />
      <TravelModal
        targetAsset={targetAsset}
        onDismiss={() => {
          router.push("/dashboard");
        }}
      />
    </section>
  );
});
