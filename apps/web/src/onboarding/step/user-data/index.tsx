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
    <div className="flex min-h-screen w-full flex-col items-center gap-[115px] bg-[#070707] py-6">
      {/* Main Content */}
      <div className="flex w-full max-w-md flex-col gap-[22px] px-8">
        {/* Heading */}
        <h1 className="text-xl font-normal text-white">Create an Account</h1>
        {/* Subheading */}
        <p className="font-thin text-white">
          Enter a name for your account below.
        </p>
        {/* Input Field */}
        <div className="flex w-full items-center rounded-[5px] border border-[#32c9af]">
          <Input
            labelClassname="text-white text-lg font-normal "
            className="h-[46px] w-full border-0 bg-transparent text-lg font-normal text-white placeholder:text-gray-400 focus:outline-none"
            value={draft.value.name}
            onChange={(value) => {
              draft.value.setName(value);
            }}
            placeholder="My Obi Wallet"
          />
        </div>
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
          {next && (
            <button
              onClick={next}
              disabled={!draft.value.name}
              className={`h-[46px] flex-1 rounded-[5px] py-2.5 ${
                draft.value.name
                  ? "cursor-pointer bg-[#32c9af]"
                  : "cursor-not-allowed bg-[#32c9af] opacity-50"
              } flex items-center justify-center`}
            >
              <span className="text-center text-xl font-normal text-[#070707]">
                Confirm
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
