"use client";
import Typography from "@/components/Typography";
import Stepper from "@/components/Stepper";

import {
  FaCheck,
  FaKey,
  FaLock,
  FaPlusCircle,
  FaGoogle,
  FaWindows,
  FaTelegram,
} from "react-icons/fa";

import ButtonLink from "@/components/links/ButtonLink";
import List from "@/components/List";
import { cn } from "@/lib/utils";

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
    checked: true,
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

export default function Step3() {
  return (
    <section className="flex flex-col items-center space-y-7">
      <Stepper currentStep={4} />
      <Typography fontWeight="bold" size="3xl">
        Add More Keys?
      </Typography>
      <Typography
        className="w-96 text-center"
        fontWeight="medium"
        leading="tight"
        color="zinc"
      >
        You can add more keys for enhanced security or begin using your wallet
        now.
      </Typography>

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
              <Typography className="ml-4">{key.title}</Typography>
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

      <div className="grid w-full grid-cols-2 gap-6">
        <ButtonLink
          href="/onboarding/step3"
          className="block w-full"
          variant="outline"
        >
          Back
        </ButtonLink>
        <ButtonLink
          href="/onboarding/step5"
          className="block w-full"
          variant="primary"
        >
          Skip For Now
        </ButtonLink>
      </div>
    </section>
  );
}
