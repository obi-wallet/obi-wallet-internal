"use client";

import { Footer } from "@/components";
import { Provider } from "@/components/provider";
import { obiModalConfig } from "@obi-wallet/config";
import { ReactNode } from "react";

export default function OnboardLayout({ children }: { children: ReactNode }) {
  return (
    <Provider
      // TODO: Add env variables
      env={{
        PHONE_NUMBER_KEY_SECRET: "TODO",
        PHONE_NUMBER_TWILIO_BASIC_AUTH_USER: "TODO",
        PHONE_NUMBER_TWILIO_BASIC_AUTH_PASSWORD: "TODO",
      }}
      config={obiModalConfig}
    >
      <section className="flex w-full flex-col items-center justify-center">
        <div className="mt-24 w-fit grow ">{children}</div>
        <Footer />
      </section>
    </Provider>
  );
}
