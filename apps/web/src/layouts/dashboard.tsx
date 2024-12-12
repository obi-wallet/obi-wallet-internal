import { DashboardHeader } from "@/components";
import { Education } from "@/components/education";
import { RouteTopics } from "@/components/education/route-topics";
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
        <RouteTopics />
        <section
          className={cn(
            "dashboard-custom-layout flex h-full w-full flex-col max-md:px-3 md:flex-row",
          )}
        >
          {nav}
          <div className="dashboard-custom-layout-notifications-wrapper flex flex-col max-md:w-full md:px-7 md:pt-3">
            {notifications}
            <div className="flex h-full">
              <div
                className={cn(
                  "dashboard-custom-layout-content h-full flex-1",
                  "scrollbar-hide space-y-2 overflow-auto py-3 max-md:px-1 max-md:py-3 max-sm:px-0",
                )}
              >
                {children}
              </div>
              <div className="education-wrapper scrollbar-hide w-80 max-md:w-0">
                <Education />
              </div>
            </div>
          </div>
        </section>
      </MainContainer>
    </>
  );
}
