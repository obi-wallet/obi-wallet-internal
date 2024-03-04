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
        "flex max-h-[calc(100vh_-_80px)] flex-grow flex-col-reverse max-md:max-h-[calc(100dvh_-_60px)] md:flex-row",
      )}
    >
      {nav}
      <div className={cn("md:p-4", "flex-grow overflow-auto ")}>
        <UserInteractionsHandlers>{children}</UserInteractionsHandlers>
        {/* </div> */}
      </div>
      <WalletBackupFixer />
    </section>
  );
}
