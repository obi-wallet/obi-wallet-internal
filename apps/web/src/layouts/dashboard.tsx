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
    <section className={cn("flex flex-grow flex-row ")}>
      {nav}
      <div
        className={cn(
          "p-4",
          "flex-grow max-md:py-0",
          "overflow-auto max-md:max-h-[calc(100vh-96px-80px)] md:max-h-[calc(100vh-80px)]",
        )}
      >
        <UserInteractionsHandlers>{children}</UserInteractionsHandlers>
        {/* </div> */}
      </div>
      <WalletBackupFixer />
    </section>
  );
}
