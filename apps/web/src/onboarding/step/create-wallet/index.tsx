"use client";

import { Text } from "@/components";
import { useStore } from "@/contexts";
import { CreateWalletOnboardingStep } from "@/onboarding/onboarding-step";
import { StepProps } from "@/onboarding/step";
import { ObservableMpcWallet } from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useEffectOnceWhen } from "rooks";

export const CreateWalletStep = observer(function CreateWalletStep({
  draft,
  step,
}: StepProps<CreateWalletOnboardingStep>) {
  const { mpcWalletsStore, userDataStore } = useStore();
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

      draft.value.confirmOwner();
      await draft.value.continueFlow();
      const walletData = draft.value.toMpcWalletData();
      userDataStore.setUserData(walletData.userEntryAddress, {
        name: draft.value.name,
        avatar: draft.value.image,
      });
      mpcWalletsStore.upsertWallet(ObservableMpcWallet.create(walletData));
      return true;
    },
    onSuccess() {
      if (step.waitUntilDone) onDone();
    },
    retry: 3,
  });

  useEffectOnceWhen(() => {
    createWalletMutation.mutate();
    if (!step.waitUntilDone) onDone();
  });

  if (!step.waitUntilDone) return null;

  if (createWalletMutation.isPending)
    return (
      <div className="flex flex-col items-center justify-center">
        <img
          src="/assets/images/loading.gif"
          alt="loading"
          style={{
            marginTop: "-20px",
          }}
        />

        <LoadingText />
      </div>
    );

  return null;
});
const messages = [
  "Building your all-chains account…",
  "Rolling your secure key shards…",
  "This will only take a few moments…",
  "Adding EVM chains…",
  "Adding Cosmos chains…",
  "Securing your non-custodial fast travel tunnel…",
];
const getRandomMessage = () => {
  return messages[Math.floor(Math.random() * messages.length)];
};
function LoadingText() {
  const [message, setMessage] = useState(getRandomMessage());
  useEffect(() => {
    const interval = setInterval(() => {
      setMessage(getRandomMessage);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return <Text className=" text-center">{message}</Text>;
}
