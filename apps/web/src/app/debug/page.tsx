"use client";

import { Button } from "@/components";
import { useStore } from "@/contexts";
import { OnboardingPayload } from "@/onboarding/onboarding-payload";
import { SecretJsHomeChainId } from "@obi-wallet/sdk";

export default function DebugPage() {
  const { wasmStore } = useStore();

  return (
    <Button
      onClick={async () => {
        console.log("fetching wasm");
        const wasm = await wasmStore.getMpcEcdsaWasm();

        const onboardingPayload = new OnboardingPayload(
          SecretJsHomeChainId.MAINNET,
        );
        const foo = await onboardingPayload.distributeShares(wasm);
        console.log(foo);
      }}
    ></Button>
  );
}
