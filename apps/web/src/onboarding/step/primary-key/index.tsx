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
    setUseCloudKey((prev) => {return !prev});
  };

  const handlePrimaryAction = () => {
    if (useCloudKey) {
      cloudKeyFlow.mutate();
    } else {
      passkeyFlow.mutate();
    }
  };

  return (
    <div className="flex flex-col items-center gap-[70px] bg-[#070707] w-full min-h-screen py-6">
      {/* Main Content */}
      <div className="flex flex-col gap-[22px] w-full max-w-md px-8">
        {/* Heading */}
        <h1 className="text-white text-xl font-normal font-roboto-mono">
          Secure Your Account
        </h1>

        {/* Subheading */}
        {useCloudKey ? (
          <p className="text-white text-xl font-normal font-roboto-mono">
            Create a cloud key to secure your account. This key is associated with a third party cloud storage service.
            <br />
            <br />
            You can add more keys later for increased security, or{" "}
            <span
              onClick={handleClickHere}
              className="text-[#32c9af] cursor-pointer"
            >
              click here
            </span>{" "}
            if you’d prefer to create a passkey.
          </p>
        ) : (
          <p className="text-white text-xl font-normal font-roboto-mono">
            Create a passkey to secure your account. This key is associated with the device you’re currently using.
            <br />
            <br />
            You can add more keys later for increased security, or{" "}
            <span
              onClick={handleClickHere}
              className="text-[#32c9af] cursor-pointer"
            >
              click here
            </span>{" "}
            if you can’t create a passkey.
          </p>
        )}

        {/* Buttons */}
        <div className="flex gap-[22px] w-full">
          {back && (
            <button
              onClick={back}
              className="flex-1 h-[46px] py-2.5 rounded-[5px] border border-white flex justify-center items-center"
            >
              <span className="text-center text-white text-xl font-normal font-roboto-mono">
                Back
              </span>
            </button>
          )}
          <button
            onClick={handlePrimaryAction}
            className="flex-1 h-[46px] py-2.5 bg-[#32c9af] rounded-[5px] flex justify-center items-center"
          >
            <span className="text-center text-[#070707] text-xl font-normal font-roboto-mono">
              {useCloudKey ? "New Cloud Key" : "New Passkey"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
});
