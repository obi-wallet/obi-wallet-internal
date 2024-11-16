import { DashboardHeader } from "@/components";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

import { MainContainer } from "./root";

export function DashboardCustomLayout({
  children,
  nav,
}: {
  children: ReactNode;
  nav?: ReactNode;
}) {
  return (
    <>
      <DashboardHeader />
      <MainContainer>
        <section
          className={cn(
            "flex max-h-[calc(100vh_-_80px)] flex-grow flex-col-reverse max-md:max-h-[calc(100dvh_-_64px)] md:flex-row",
          )}
        >
          {nav}
          <div
            className={cn(
              "md:px-7 md:py-3",
              "flex-grow space-y-2 overflow-auto p-3 max-sm:p-0",
            )}
          >
            {children}
          </div>
        </section>
      </MainContainer>
    </>
  );
}
