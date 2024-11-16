"use client";

import { UserDataOnboardingStep } from "@/onboarding/onboarding-step";
import { StepProps } from "@/onboarding/step";
import { Input } from "@/ui/input";
import { observer } from "mobx-react-lite";

export const UserDataStep = observer(function UserDataStep({
  draft,
  back,
  next,
}: StepProps<UserDataOnboardingStep>) {
  return (
    <div className="flex flex-col items-center gap-[115px] bg-[#070707] w-full min-h-screen py-6">
      {/* Main Content */}
      <div className="flex flex-col gap-[22px] w-full max-w-md px-8">
        {/* Heading */}
        <h1 className="text-white text-xl font-normal font-roboto-mono">
          Create an Account
        </h1>
        {/* Subheading */}
        <p className="text-white text-xl font-normal font-roboto-mono">
          Enter a name for your account below.
        </p>
        {/* Input Field */}
        <div className="w-full rounded-[5px] border border-[#32c9af] flex items-center">
          <Input
            labelClassname="text-white text-lg font-normal font-roboto-mono"
            className="w-full bg-transparent text-white text-lg font-normal font-roboto-mono placeholder:text-gray-400 focus:outline-none border-0"
            value={draft.value.name}
            onChange={(value) => {
              draft.value.setName(value);
            }}
            placeholder="new_wallet_name"
          />
        </div>
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
          {next && (
            <button
              onClick={next}
              disabled={!draft.value.name}
              className={`flex-1 h-[46px] py-2.5 rounded-[5px] ${
                draft.value.name
                  ? "bg-[#32c9af] cursor-pointer"
                  : "bg-[#32c9af] opacity-50 cursor-not-allowed"
              } flex justify-center items-center`}
            >
              <span className="text-center text-[#070707] text-xl font-normal font-roboto-mono">
                Confirm
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
