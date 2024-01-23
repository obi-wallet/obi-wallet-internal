"use client";

import { Button, Text } from "@/components";
import {
  OnboardingFromType,
  PrimaryKeyOnboardingStep,
} from "@/onboarding/onboarding-step";
import { StepProps } from "@/onboarding/step";
import { createPasskey, KeyType, Sdk } from "@obi-wallet/sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import Image from "next/image";

export const PrimaryKeyStep = observer(function PrimaryKeyStep({
  draft,
  back,
  next,
  step,
}: StepProps<PrimaryKeyOnboardingStep>) {
  const queryClient = useQueryClient();

  const passkeyFlow = useMutation({
    mutationFn: async () => {
      const keyPair = await createPasskey();
      await draft.value.setPrimaryKey({
        key: {
          type: KeyType.Device,
          payload: keyPair,
        },
      });

      await queryClient.prefetchQuery(
        Sdk.chainId(draft.value.chainId).transactions.prepareKeyPairQuery(
          keyPair,
        ),
      );
      if (next) next();
    },
  });

  return (
    <>
      <Text fontWeight="bold" size="3xl">
        {step.from === OnboardingFromType.External
          ? "Secure Your Asset"
          : "Create Your First Key"}
      </Text>
      <Text
        className="w-96 text-center"
        fontWeight="medium"
        leading="tight"
        color="zinc"
      >
        {step.from === OnboardingFromType.External
          ? "Create a passkey to secure access to your SEI tokens and other assets."
          : "Sign in with one of the services below to create your first key."}
      </Text>

      {step.from === OnboardingFromType.External && (
        <Image
          width="192"
          height="192"
          src="/assets/images/external-passkey.png"
          alt="passkey"
        />
      )}

      <Button
        onClick={() => {
          passkeyFlow.mutate();
        }}
        className="block w-full"
        variant="primary"
      >
        <div>Passkey</div>
        {/* TODO: recommendation only makes sense when we have multiple options */}
        {/*<div>(Recommended)</div>*/}
      </Button>
      <Button disabled className="block w-full" variant="primary">
        More Services Coming Soon
      </Button>

      {/* TODO: cloud keys aren't integrated yet */}
      {/*<div className="flex w-full items-center">*/}
      {/*  <div className="h-0.5 w-full rounded-lg bg-gray-600" />*/}
      {/*  <Text className="grow-0 px-3" color="gray">*/}
      {/*    OR*/}
      {/*  </Text>*/}
      {/*  <div className="h-0.5 w-full rounded-lg bg-gray-600" />*/}
      {/*</div>*/}

      {/*<div className="flex w-full flex-row justify-around">*/}
      {/*  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">*/}
      {/*    <FaApple className="h-9 w-9 text-white" />*/}
      {/*  </div>*/}
      {/*  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">*/}
      {/*    <FaGoogle className="h-7 w-7 text-white" />*/}
      {/*  </div>*/}
      {/*  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">*/}
      {/*    <FaWindows className="h-7 w-7 text-white" />*/}
      {/*  </div>*/}
      {/*</div>*/}

      {back ? (
        <Button onClick={back} className="block w-full" variant="outline">
          Back
        </Button>
      ) : null}
    </>
  );
});
