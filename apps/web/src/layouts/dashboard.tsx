import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function DashboardCustomLayout({
  children,
  nav,
}: {
  children: ReactNode;
  nav?: ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex max-h-[calc(100vh_-_80px)] flex-grow flex-col-reverse max-md:max-h-[calc(100dvh_-_64px)] md:flex-row",
      )}
    >
      {nav}
      <div className={cn("md:p-4", "flex-grow space-y-2 overflow-auto")}>
        {children}
      </div>
    </section>
  );
}
