import { cn } from "@/lib/utils";
import { UserInteractionsHandlers } from "@/user-interactions";
import { Inter } from "next/font/google";
import { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"] });

export function RootContainer({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        inter.className,
        "flex h-full flex-grow flex-col",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function MainContainer({ children }: { children: ReactNode }) {
  return (
    <main id="main" className="flex h-full w-full flex-1 grow">
      <UserInteractionsHandlers>{children}</UserInteractionsHandlers>
    </main>
  );
}
