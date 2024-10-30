"use client";

import { Text } from "@/components";
import { BitButton } from "@/components/buttons/8bit-button";
import { PrimaryKeyOnboardingStep } from "@/onboarding/onboarding-step";
import { useGoogleAuth } from "@/hooks/use-google-auth";
import { StepProps } from "@/onboarding/step";
import { createPasskey, KeyType } from "@obi-wallet/sdk";
import { generateSecp256k1KeyPair } from "@obi-wallet/sdk-secp256k1";
import { useMutation } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { observer } from "mobx-react-lite";
import Image from "next/image";

export const PrimaryKeyStep = observer(function PrimaryKeyStep({
  draft,
  back,
  next,
}: StepProps<PrimaryKeyOnboardingStep>) {
  const { uploadFile } = useGoogleAuth();

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

  const cloudKeyFlow = useMutation({
    mutationFn: async () => {
      const keyPair = generateSecp256k1KeyPair();
      draft.value.setPrimaryKey({
        key: {
          type: KeyType.Cloud,
          payload: keyPair,
        },
      });
      const timestamp = DateTime.now().toISO();
      const fileName = `obi-${timestamp}.key`;
      try {
        await uploadFile(keyPair, fileName, "application/json");
        if (next) next();
      } catch (e) {
        console.error(e);
      }
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
          Passkey
        </BitButton>
        <BitButton
          onClick={() => {
            cloudKeyFlow.mutate();
          }}
        >
          Cloud Key
        </BitButton>

        {back ? <BitButton onClick={back}>Back</BitButton> : null}
      </div>
    </>
  );
});
