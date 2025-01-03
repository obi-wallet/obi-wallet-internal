"use client";

import { EffectStateDispatch } from "@/effect/effect-state";
import { encryptionToolsLayer } from "@/effect/encryption-tools-layer/production";
import { Effect } from "effect";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useEffectOnceWhen } from "rooks";

import { CreateWalletState, OnboardingState } from "../state";

export interface CreateWalletStepProps {
  state: CreateWalletState;
  dispatch: EffectStateDispatch<typeof OnboardingState>;
}

export const CreateWalletStep = observer<CreateWalletStepProps>(
  function CreateWalletStep({ state }) {
    const router = useRouter();

    useEffectOnceWhen(async () => {
      await Effect.runPromise(
        Effect.provide(state.createLocalWallet(), encryptionToolsLayer),
      );
      router.replace("/dashboard");
    });

    return (
      <div className="flex min-h-screen w-full flex-col items-center gap-[105px] bg-[#070707] py-6">
        {/* Loading Animation */}
        <div className="flex w-full max-w-md flex-col items-center gap-[22px] px-8">
          <LoadingText />
          <LoadingDots />
        </div>
      </div>
    );
  },
);

const messages = [
  "Creating Your All-Chains Account",
  "Adding EVM Chains",
  "Adding Cosmos Chains",
  "Adding Solana",
  "Initializing Your Policy Engine",
];

function LoadingText() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => {
        return (prevIndex + 1) % messages.length;
      });
    }, 2000);

    return () => {
      return clearInterval(interval);
    };
  }, []);

  return (
    <div className="h-[96px] w-full">
      <div className="min-h-[32px] w-full text-left text-xl font-normal text-white">
        <span className="inline-block min-w-[300px]">
          {messages[messageIndex]}
        </span>
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
    }, 500);

    return () => {
      return clearInterval(interval);
    };
  }, []);

  const dots = ".".repeat(dotCount);
  const baseMessage = "This should only take a few seconds";

  return (
    <div className="h-[26px] w-full">
      <div className="flex w-full text-left text-xl font-normal text-white">
        <span className="inline-block min-w-[280px]">
          {baseMessage}
          {dots}
        </span>
      </div>
    </div>
  );
}
