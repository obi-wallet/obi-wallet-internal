"use client";

import { Text } from "@/components";
import { useStore } from "@/contexts";
import { CongratulationsOnboardingStep } from "@/onboarding";
import { OnboardingButtons } from "@/onboarding/onboarding-buttons";
import { StepProps } from "@/onboarding/step";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useEffectOnceWhen } from "rooks";

export const CongratulationsStep = observer(function CongratulationsStep({
  draft,
  next,
}: StepProps<CongratulationsOnboardingStep>) {
  const { walletsStore } = useStore();

  const createWalletMutation = useMutation({
    mutationFn: async () => {
      const account = await draft.value.finishWalletCreation();
      draft.value.multisigKey.setSetupDetails(account);
      return await walletsStore.createWallet({
        multisigKey: draft.value.multisigKey,
        demoMode: false,
      });
    },
    onSuccess(value) {
      console.log("success", value);
      // if (value) {
      //   awaitableMultisigSigner.set(value);
      // }
    },
    onError(error) {
      console.log("error", error);
      // onError(error as Error);
    },
    retry: 2,
  });

  console.log(createWalletMutation.isLoading, createWalletMutation.isSuccess);

  useEffectOnceWhen(() => {
    createWalletMutation.mutate();
  });

  return (
    <>
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

      <OnboardingButtons
        next={next}
        nextLabel="Go To Wallet"
        nextDisabled={!createWalletMutation.isSuccess}
      />
    </>
  );
});
