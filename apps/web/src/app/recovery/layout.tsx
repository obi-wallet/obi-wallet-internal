"use client";

import { Footer, Header } from "@/components";
import { MainContainer } from "@/layouts/root";
import { ReactNode } from "react";

export default function OnboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <MainContainer>
        <section className="flex w-full flex-col items-center justify-center">
          <div className="mt-24 w-fit grow max-sm:w-full">{children}</div>
          <Footer />
        </section>
      </MainContainer>
    </>
  );
}
