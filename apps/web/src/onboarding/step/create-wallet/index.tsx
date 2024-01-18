"use client";

import { Text } from "@/components";
import { useStore } from "@/contexts";
import { CreateWalletOnboardingStep } from "@/onboarding/onboarding-step";
import { StepProps } from "@/onboarding/step";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { useEffectOnceWhen } from "rooks";

export const CreateWalletStep = observer(function CreateWalletStep({
  draft,
  step,
}: StepProps<CreateWalletOnboardingStep>) {
  const { walletsStore } = useStore();
  const router = useRouter();

  const onDone = () => {
    router.replace(step.redirectTo);
  };

  const createWalletMutation = useMutation({
    mutationFn: async () => {
      if (step.demoMode) {
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(true);
          }, 5000);
        });
        return;
      }

      draft.value.createMagicAccountInBackground();
      await draft.value.finishWalletCreation();
      await walletsStore.createWallet({
        multisigKey: draft.value.multisigKey,
        demoMode: false,
      });
      return true;
    },
    onSuccess(value) {
      console.log("success", value);
      if (step.waitUntilDone) onDone();
    },
  });

  useEffectOnceWhen(() => {
    createWalletMutation.mutate();
    if (!step.waitUntilDone) onDone();
  });

  if (!step.waitUntilDone) return null;
  if (createWalletMutation.isLoading) return <Text color="white">Loading</Text>;

  return null;
});
