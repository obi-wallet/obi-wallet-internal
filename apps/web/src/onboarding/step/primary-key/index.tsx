"use client";

import { useGoogleAuth } from "@/hooks/use-google-auth";
import { PrimaryKeyOnboardingStep } from "@/onboarding/onboarding-step";
import { StepProps } from "@/onboarding/step";
import { createPasskey, KeyType } from "@obi-wallet/sdk";
import { generateSecp256k1KeyPair } from "@obi-wallet/sdk-secp256k1";
import { useMutation } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { observer } from "mobx-react-lite";
import { useState } from "react";

export const PrimaryKeyStep = observer(function PrimaryKeyStep({
  draft,
  back,
  next,
}: StepProps<PrimaryKeyOnboardingStep>) {
  // Ignore this if we're running in dev mode
  const { uploadFile } = useGoogleAuth();
  const [useCloudKey, setUseCloudKey] = useState(false);

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

  const handleClickHere = () => {
    setUseCloudKey((prev) => {
      return !prev;
    });
  };

  const handlePrimaryAction = () => {
    if (useCloudKey) {
      cloudKeyFlow.mutate();
    } else {
      passkeyFlow.mutate();
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center gap-[70px] bg-[#070707] py-6">
      {/* Main Content */}
      <div className="flex w-full max-w-md flex-col gap-[22px] px-8">
        {/* Heading */}
        <h1 className="text-xl font-normal text-white">Secure Your Account</h1>

        {/* Subheading */}
        {useCloudKey ? (
          <p className="font-light text-white">
            Create a cloud key to secure your account. This key is associated
            with a third party cloud storage service. Google Drive is currently
            supported, with more providers coming soon.
            <br />
            <br />
            You can add more keys later for increased security, or{" "}
            <span
              onClick={handleClickHere}
              className="cursor-pointer text-[#32c9af]"
            >
              click here
            </span>{" "}
            if you’d prefer to create a passkey instead.
          </p>
        ) : (
          <p className="font-light text-white">
            Create a passkey to secure your account. This key is associated with
            the device you’re currently using.
            <br />
            <br />
            You can add more keys later for increased security, or{" "}
            <span
              onClick={handleClickHere}
              className="cursor-pointer text-[#32c9af]"
            >
              click here
            </span>{" "}
            if you can’t create a passkey, or if nothing happens when you
            attempt to create one.
          </p>
        )}

        {/* Buttons */}
        <div className="flex w-full gap-[22px]">
          {back && (
            <button
              onClick={back}
              className="flex h-[46px] flex-1 items-center justify-center rounded-[5px] border border-white py-2.5"
            >
              <span className="text-center text-xl font-normal text-white">
                Back
              </span>
            </button>
          )}
          <button
            onClick={handlePrimaryAction}
            className="flex h-[46px] flex-1 items-center justify-center rounded-[5px] bg-[#32c9af] py-2.5"
          >
            <span className="text-center text-xl font-normal text-[#070707]">
              {useCloudKey ? "New Cloud Key" : "New Passkey"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
});
