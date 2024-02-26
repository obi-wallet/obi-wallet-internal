import { UserInteractionsHandlers } from "@/user-interactions";
import { ReactNode } from "react";

export function DashboardCustomLayout({
  children,
  left,
}: {
  children: ReactNode;
  left?: ReactNode;
}) {
  return (
    <section className="relative flex w-full">
      {left}
      <div className="flex grow overflow-auto py-5 max-sm:h-[calc(100vh-96px-80px)] max-sm:px-4 max-sm:py-0 sm:px-7">
        <UserInteractionsHandlers>{children}</UserInteractionsHandlers>
      </div>
    </section>
  );
}
