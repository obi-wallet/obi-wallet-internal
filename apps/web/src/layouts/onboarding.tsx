import { Footer, Header } from "@/components";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

import { MainContainer } from "./root";

export function OnboardingCustomLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <MainContainer>
        <section className="flex w-full flex-col items-center justify-center max-sm:px-3">
          <div
            className={cn(
              "mt-[25vh] w-full max-w-xl grow",
              "max-md:mt-[20vh] max-md:flex max-md:flex-col max-md:justify-center max-sm:w-full",
            )}
          >
            {children}
          </div>
          <Footer />
        </section>
      </MainContainer>
    </>
  );
}
