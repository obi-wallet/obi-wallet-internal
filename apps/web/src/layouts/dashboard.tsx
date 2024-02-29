import { cn } from "@/lib/utils";
import { UserInteractionsHandlers } from "@/user-interactions";
import { ReactNode } from "react";

import { WalletBackupFixer } from "./wallet-backup-fixer";

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
        "relative flex w-full  flex-1 flex-col-reverse  max-md:overflow-scroll",
        "h-[100dvh]",
        "max-md:pb-20",
        "max-md:pt-16",
        " md:flex-row",
      )}
    >
      {nav}
      <div
        className={cn(
          "box-border flex flex-1  flex-col  md:h-[100vh]  md:overflow-auto md:p-4",
          "md:ml-[334px] ",
          "md:mt-24",
          "md:pb-28",
        )}
      >
        <UserInteractionsHandlers>{children}</UserInteractionsHandlers>
      </div>
      <WalletBackupFixer />
    </section>
  );
}
