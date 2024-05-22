"use client";

import { BitButton } from "@/components/buttons/8bit-button";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { observer } from "mobx-react-lite";
import Image from "next/image";

export default observer(function Introduction() {
  useCurrentWallet({ redirectTo: "/dashboard", redirectIfFound: true });

  return (
    <section className="flex w-full flex-col items-center space-y-9 p-5 max-sm:px-10">
      <Image
        width="306"
        height="234"
        src="/assets/images/obi-wizard.png"
        alt="OBI Logo"
        className="mt-48"
      />
      <BitButton
        href="/onboarding/internal"
        className="font-PressStart2P before:contents: bg-transparent"
      >
        Press Start
      </BitButton>
    </section>
  );
});
