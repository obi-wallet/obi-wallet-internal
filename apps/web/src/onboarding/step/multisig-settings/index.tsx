"use client";

import { List, Text } from "@/components";
import { cn } from "@/lib/utils";
import { MultisigSettingsOnboardingStep } from "@/onboarding";
import { OnboardingButtons } from "@/onboarding/onboarding-buttons";
import { StepProps } from "@/onboarding/step";
import { KeyType } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import {
  FaCheck,
  FaGoogle,
  FaLock,
  FaPlusCircle,
  FaTelegram,
  FaWindows,
} from "react-icons/fa";

export const MultisigSettingsStep = observer(function MultisigSettingsStep({
  draft,
  back,
  next,
}: StepProps<MultisigSettingsOnboardingStep>) {
  const [choice, _setChoice] = useState(null);
  const multisigKey = draft.value.multisigKey;

  const keyOptions = [
    // TODO: this should be Passkey, see also icon on Figma
    {
      id: "key-desktop",
      icon: <FaWindows className="h-5 w-5" color="white" />,
      title: "Passkey",
      checked: multisigKey.hasKeyOfType(KeyType.Device),
    },
    {
      id: "key-cloud",
      icon: <FaGoogle className="h-5 w-5" color="white" />,
      title: "Cloud Key",
      checked: multisigKey.hasKeyOfType(KeyType.Cloud),
    },
    {
      id: "key-sms",
      icon: <FaLock className="h-5 w-5" color="white" />,
      title: "SMS Key",
      checked: multisigKey.hasKeyOfType(KeyType.Phone),
    },
    {
      id: "key-telegram",
      icon: <FaTelegram className="h-5 w-5" color="white" />,
      title: "Telegram Key",
      checked: multisigKey.hasKeyOfType(KeyType.Telegram),
    },
  ];

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
