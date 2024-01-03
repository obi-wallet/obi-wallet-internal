"use client";

import { Footer } from "@/components";
import { Provider } from "@/components/provider";
import { ReactNode } from "react";

export default function OnboardLayout({ children }: { children: ReactNode }) {
  return (
    <Provider>
      <section className="flex w-full flex-col items-center justify-center">
        <div className="mt-24 w-fit grow ">{children}</div>
        <Footer />
      </section>
    </Provider>
  );
}
