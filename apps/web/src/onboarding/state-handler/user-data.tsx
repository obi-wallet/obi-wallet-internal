"use client";

import { EffectStateDispatch } from "@/effect/effect-state";
import { Input } from "@/ui/input";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { InitialState, OnboardingState } from "../state";

export interface UserDataStepProps {
  state: InitialState;
  dispatch: EffectStateDispatch<typeof OnboardingState>;
}

export const UserDataStep = observer<UserDataStepProps>(function UserDataStep({
  state,
  dispatch,
}) {
  const router = useRouter();
  const [name, setName] = useState(state.initialName);

  return (
    <div className="onboarding-container flex min-h-screen w-full flex-col items-center gap-[115px] bg-[#070707] py-6">
      {/* Main Content */}
      <div className="onboarding-content flex w-full max-w-xl flex-col gap-[22px] px-8">
        {/* Heading */}
        <h1 className="onboarding-heading text-xl font-normal text-white">
          Create an Account
        </h1>
        {/* Subheading */}
        <p className="onboarding-subheading font-thin text-white">
          Enter a name for your account below.
        </p>
        {/* Input Field */}
        <div className="onboarding-input-container flex w-full items-center rounded-[5px] border border-[#32c9af]">
          <Input
            labelClassname="onboarding-input-label text-white text-lg font-normal"
            className="onboarding-input h-[46px] w-full border-0 bg-transparent text-lg font-normal text-white placeholder:text-gray-400 focus:outline-none"
            value={name}
            onChange={(value) => {
              setName(value);
            }}
            placeholder="My Obi Wallet"
          />
        </div>
        {/* Buttons */}
        <div className="onboarding-buttons flex w-full gap-[22px]">
          <button
            onClick={async () => {
              await router.push("/");
            }}
            className="onboarding-back-button flex h-[46px] flex-1 items-center justify-center rounded-[5px] border border-white py-2.5"
          >
            <span className="onboarding-back-text text-center text-xl font-normal text-white">
              Back
            </span>
          </button>
          <button
            onClick={async () => {
              await dispatch(state.setName(name));
            }}
            disabled={!name}
            className={`onboarding-confirm-button h-[46px] flex-1 rounded-[5px] py-2.5 ${
              name
                ? "cursor-pointer bg-[#32c9af]"
                : "cursor-not-allowed bg-[#32c9af] opacity-50"
            } flex items-center justify-center`}
          >
            <span className="onboarding-confirm-text text-center text-xl font-normal text-[#070707]">
              Confirm
            </span>
          </button>
        </div>
      </div>
    </div>
  );
});
