"use client";

import { Button, Text } from "@/components";
import { CURRENT_THEME } from "@/configs";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { observer } from "mobx-react-lite";
import Image from "next/image";

export default observer(function Introduction() {
  useCurrentWallet({ redirectTo: "/dashboard", redirectIfFound: true });

  return (
    <section className="flex w-full flex-col items-center justify-center space-y-9 p-5 max-sm:px-10">
      <Text className="text-2xl" leading="normal" fontWeight="bold">
        {CURRENT_THEME.explaination.title || "What is an Obi Account?"}
      </Text>
      <Image
        width="151"
        height="268"
        src="/assets/images/obi-wizard.png"
        alt="Icon"
      />
      <div className="w-[440px] space-y-9 max-sm:w-full">
        <Text
          className="text-center text-base "
          color="zinc"
          fontWeight="medium"
          leading="tight"
        >
          {CURRENT_THEME.explaination.description ||
            "Obi Smart Accounts are a convenient and secure way to custody your crypto assets without the risk and hassle of seed phrases or private keys."}
        </Text>
        <Button
          href="/onboarding/internal"
          className="block w-full"
          variant="primary"
        >
          Get Started
        </Button>
      </div>
    </section>
  );
});
