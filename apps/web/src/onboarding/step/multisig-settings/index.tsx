"use client";

import { List, Text } from "@/components";
import { cn } from "@/lib/utils";
import { MultisigSettingsOnboardingStep } from "@/onboarding";
import { OnboardingButtons } from "@/onboarding/onboarding-buttons";
import { StepProps } from "@/onboarding/step";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import {
  FaCheck,
  FaGoogle,
  FaKey,
  FaLock,
  FaPlusCircle,
  FaTelegram,
  FaWindows,
} from "react-icons/fa";

const keyOptions = [
  {
    id: "key-desktop",
    icon: <FaWindows className="h-5 w-5" color="white" />,
    title: "Desktop Key",
    checked: true,
  },
  {
    id: "key-cloud",
    icon: <FaGoogle className="h-5 w-5" color="white" />,
    title: "Cloud Key",
    checked: false,
  },
  {
    id: "key-sms",
    icon: <FaLock className="h-5 w-5" color="white" />,
    title: "Sms Key",
    checked: false,
  },
  {
    id: "key-telegram",
    icon: <FaTelegram className="h-5 w-5" color="white" />,
    title: "Telegram Key",
    checked: false,
  },
  {
    id: "key-etc",
    icon: <FaKey className="h-5 w-5" color="white" />,
    title: "Key Option #5",
    checked: false,
  },
];

export const MultisigSettingsStep = observer(function MultisigSettingsStep({
  back,
  next,
}: StepProps<MultisigSettingsOnboardingStep>) {
  const [choice, _setChoice] = useState(null);

  switch (choice) {
    default:
      return (
        <>
          <Text fontWeight="bold" size="3xl">
            Add More Keys?
          </Text>
          <Text
            className="w-96 text-center"
            fontWeight="medium"
            leading="tight"
            color="zinc"
          >
            You can add more keys for enhanced security or begin using your
            wallet now.
          </Text>

          <List
            items={keyOptions}
            renderItem={(key) => (
              <div
                className={cn(
                  "flex h-14 w-full min-w-[312px] cursor-pointer items-center justify-between rounded-xl px-4",
                  key.checked ? "bg-blue-600" : "bg-zinc-800",
                )}
              >
                <div className="flex items-center">
                  {key.icon}
                  <Text className="ml-4">{key.title}</Text>
                </div>
                {key.checked ? (
                  <FaCheck className="h-5 w-5 font-bold text-white" />
                ) : (
                  <FaPlusCircle className="h-5 w-5 text-white" color="white" />
                )}
              </div>
            )}
            keyProp="id"
            className="mt-8 w-full space-y-2"
            name="key-manage"
          />

          <OnboardingButtons back={back} next={next} nextLabel="Skip For Now" />
        </>
      );
  }
});
