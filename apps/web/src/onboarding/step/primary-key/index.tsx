"use client";

import { Text } from "@/components";
import { BitButton } from "@/components/buttons/8bit-button";
import { useGoogleAuth } from "@/hooks/use-google-auth";
import {
  OnboardingFromType,
  PrimaryKeyOnboardingStep,
} from "@/onboarding/onboarding-step";
import { StepProps } from "@/onboarding/step";
import { createPasskey, KeyType } from "@obi-wallet/sdk";
import { generateSec256k1KeyPair } from "@obi-wallet/sdk-secp256k1";
import { useMutation } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { usePathname } from "next/navigation";

export const PrimaryKeyStep = observer(function PrimaryKeyStep({
  draft,
  back,
  next,
  step,
}: StepProps<PrimaryKeyOnboardingStep>) {
  const pathName = usePathname();
  const externalAsset = pathName.split("/")[2]?.split("-")[1];
  const { signIn, uploadFile } = useGoogleAuth();

  const capitalizedExternalAsset = externalAsset
    ? externalAsset?.charAt(0).toUpperCase() + externalAsset?.slice(1)
    : "";

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

  const cloudkeyFlow = useMutation({
    mutationFn: async () => {
      const keyPair = generateSec256k1KeyPair();
      draft.value.setPrimaryKey({
        key: {
          type: KeyType.Cloud,
          payload: keyPair,
        },
      });
      const googleUser = await signIn();
      if (googleUser) {
        const timestamp = DateTime.now().toISO();
        const fileName = `obi-${timestamp}.key`;
        const uploadedData = await uploadFile(
          keyPair,
          fileName,
          "application/json",
        );
        if (next && uploadedData) next();
      } else {
        console.error("Error in signing with google");
      }
    },
  });

  return (
    <>
      <Text fontWeight="bold" size="3xl" className="font-press-start-2p">
        {step.from === OnboardingFromType.External
          ? "Secure Your Asset"
          : "Create Your First Key"}
      </Text>
      <Text
        className="w-96 text-center max-sm:w-full"
        fontWeight="medium"
        leading="tight"
        color="zinc"
      >
        {step.from === OnboardingFromType.External
          ? `Create a passkey to secure access to your ${capitalizedExternalAsset} tokens and other assets.`
          : "Create a primary passkey to protect your account."}
      </Text>

      {step.from === OnboardingFromType.External ? (
        <Image
          width="192"
          height="192"
          src="/assets/images/external-passkey.png"
          alt="passkey"
        />
      ) : (
        <Image
          width="168"
          height="194"
          src="/assets/images/fingerprint.png"
          alt="OBI Logo"
          className="mt-48"
        />
      )}

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
            cloudkeyFlow.mutate();
          }}
        >
          Cloudkey
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
