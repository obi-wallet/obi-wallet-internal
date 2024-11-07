import { pressStart2P } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { UserInteractionsHandlers } from "@/user-interactions";
import { Inter } from "next/font/google";
import { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"] });

export function RootContainer({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        pressStart2P.variable,
        inter.className,
        "flex h-full flex-grow flex-col",
      )}
    >
      {children}
    </div>
  );
}

export function MainContainer({ children }: { children: ReactNode }) {
  return (
    <main className="flex h-full w-full flex-1 grow">
      <UserInteractionsHandlers>{children}</UserInteractionsHandlers>
    </main>
  );
}
