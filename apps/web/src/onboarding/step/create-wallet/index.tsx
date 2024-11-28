"use client";

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

  if (createWalletMutation.isPending) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center gap-[105px] bg-[#070707] py-6">
        {/* Loading Animation */}
        <div className="flex w-full max-w-md flex-col items-center gap-[22px] px-8">
          <LoadingText />
          <LoadingDots />
        </div>
      </div>
    );
  }

  return null;
});

const messages = [
  "Creating Your All-Chains Account       ",
  "Adding EVM Chains                     ",
  "Adding Cosmos Chains                  ",
  "Adding Solana                         ",
  "Initializing Your Policy Engine       ",
];

function LoadingText() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => {
        return (prevIndex + 1) % messages.length;
      });
    }, 2000); // Change message every 2 seconds

    return () => {
      return clearInterval(interval);
    };
  }, []);

  return (
    <div className="h-[96px] w-full">
      <div className="w-full text-left text-xl font-normal text-white">
        {messages[messageIndex]}
      </div>
    </div>
  );
}

function LoadingDots() {
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prevCount) => {
        return (prevCount + 1) % 4;
      });
    }, 500); // Change every 0.5 seconds

    return () => {
      return clearInterval(interval);
    };
  }, []);

  const dots = ".".repeat(dotCount);
  const baseMessage = "This should only take a few seconds";
  const displayedMessage = `${baseMessage}${dots}`;

  return (
    <div className="h-[26px] w-full">
      <div className="w-full text-left text-xl font-normal text-white">
        {displayedMessage}
      </div>
    </div>
  );
}
