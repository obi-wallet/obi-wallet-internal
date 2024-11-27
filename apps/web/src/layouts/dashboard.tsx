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
            "dashboard-custom-layout flex min-h-[calc(100vh_-_80px)] h-[calc(100vh_-_80px)] flex-col max-md:min-h-[calc(100dvh_-_64px)] max-md:h-[calc(100dvh_-_64px)] w-full max-md:px-3 md:flex-row",
          )}
        >
          {nav}
          <div
            className={cn(
              "dashboard-custom-layout-content scrollbar-hide h-full max-md:w-full md:px-7 md:py-3 lg:w-[50%] xl:min-w-[520px]",
              "space-y-2 overflow-auto p-3 max-md:p-1 max-sm:p-0",
            )}
          >
            {children}
          </div>
        </section>
      </MainContainer>
    </>
  );
}
