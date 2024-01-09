"use client";

import { Button, Text } from "@/components";
import { PrimaryKeyOnboardingStep } from "@/onboarding";
import { StepProps } from "@/onboarding/step";
import { PasskeyStep } from "@/onboarding/step/pass-key";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { FaApple, FaGoogle, FaWindows } from "react-icons/fa";

enum Choice {
  Passkey,
  Apple,
  Google,
  Windows,
}

export const PrimaryKeyStep = observer(function PrimaryKeyStep({
  draft,
  next,
  step,
}: StepProps<PrimaryKeyOnboardingStep>) {
  const [choice, setChoice] = useState<Choice | null>(null);

  switch (choice) {
    case Choice.Passkey:
      return (
        <PasskeyStep
          draft={draft}
          step={step}
          back={() => {
            setChoice(null);
          }}
          next={next}
        />
      );
    default:
      return (
        <>
          <Text fontWeight="bold" size="3xl">
            Create Your First Key
          </Text>
          <Text
            className="w-96 text-center"
            fontWeight="medium"
            leading="tight"
            color="zinc"
          >
            Sign in with one of the services below to create your first key.
          </Text>

          <Button
            onClick={() => {
              setChoice(Choice.Passkey);
            }}
            className="block w-full"
            variant="primary"
          >
            <div>Passkey</div>
            <div>(Recommended)</div>
          </Button>

          <div className="flex w-full items-center">
            <div className="h-0.5 w-full rounded-lg bg-gray-600" />
            <Text className="grow-0 px-3" color="gray">
              OR
            </Text>
            <div className="h-0.5 w-full rounded-lg bg-gray-600" />
          </div>

          <div className="flex w-full flex-row justify-around">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
              <FaApple className="h-9 w-9 text-white" />
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
              <FaGoogle className="h-7 w-7 text-white" />
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
              <FaWindows className="h-7 w-7 text-white" />
            </div>
          </div>
        </>
      );
  }
});
