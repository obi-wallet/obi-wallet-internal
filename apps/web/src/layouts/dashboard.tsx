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
            "flex max-h-[calc(100vh_-_80px)] flex-col max-md:max-h-[calc(100dvh_-_64px)] md:flex-row",
          )}
        >
          {nav}
          <div
            className={cn(
              "scrollbar-hide md:px-7 md:py-3 lg:w-[50%] xl:min-w-[520px]",
              "space-y-2 overflow-auto p-3 max-sm:p-0",
            )}
          >
            {children}
          </div>
        </section>
      </MainContainer>
    </>
  );
}
