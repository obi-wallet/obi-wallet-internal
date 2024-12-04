import { DashboardHeader } from "@/components";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

import { MainContainer } from "./root";

export function DashboardCustomLayout({
  children,
  nav,
  notifications,
}: {
  children: ReactNode;
  nav?: ReactNode;
  notifications?: ReactNode;
}) {
  return (
    <>
      <DashboardHeader />
      <MainContainer>
        <section
          className={cn(
            "dashboard-custom-layout flex h-[calc(100vh_-_80px)] min-h-[calc(100vh_-_80px)] w-full flex-col max-md:h-[calc(100dvh_-_64px)] max-md:min-h-[calc(100dvh_-_64px)] max-md:px-3 md:flex-row",
          )}
        >
          {nav}
          <div className="dashboard-custom-layout-notifications-wrapper flex h-full flex-col max-md:w-full md:px-7 md:py-3">
            {notifications}
            <div
              className={cn(
                "dashboard-custom-layout-content scrollbar-hide flex-1",
                "space-y-2 overflow-auto py-3 max-md:px-1 max-md:py-3 max-sm:px-0 lg:w-[50%] xl:min-w-[520px]",
              )}
            >
              {children}
            </div>
          </div>
        </section>
      </MainContainer>
    </>
  );
}
