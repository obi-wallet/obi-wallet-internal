"use client";

import { Text } from "@/components";
import { BitButton } from "@/components/buttons/8bit-button";
import { PrimaryKeyOnboardingStep } from "@/onboarding/onboarding-step";
import { StepProps } from "@/onboarding/step";
import { createPasskey, KeyType } from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import Image from "next/image";

export const PrimaryKeyStep = observer(function PrimaryKeyStep({
  draft,
  back,
  next,
}: StepProps<PrimaryKeyOnboardingStep>) {
  const passkeyFlow = useMutation({
    mutationFn: async () => {
      const keyPair = await createPasskey();
      draft.value.setPrimaryKey({
        key: {
          type: KeyType.Passkey,
          payload: keyPair,
        },
      });
      if (next) next();
    },
  });

  return (
    <>
      <Text fontWeight="bold" size="3xl" className="font-press-start-2p">
        Secure Your Account
      </Text>
      <Text
        className="w-96 text-center"
        fontWeight="medium"
        leading="tight"
        color="zinc"
      >
        Create the first & primary key to secure your account. You can add more keys later
        to increase security and recoverability.
      </Text>
      <Image
        width="262"
        height="262"
        src="/assets/images/dall.png"
        alt="Icon"
      />

      <div className="flex flex-col gap-6">
        <BitButton
          onClick={() => {
            passkeyFlow.mutate();
          }}
        >
          Continue
        </BitButton>
        {/* <Button disabled className="block w-full" variant="primary">
        More Services Coming Soon
      </Button> */}

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

        {back ? <BitButton onClick={back}>Back</BitButton> : null}
      </div>
    </>
  );
});
