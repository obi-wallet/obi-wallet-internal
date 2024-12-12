import { cn } from "@/lib/utils";
import { UserInteractionsHandlers } from "@/user-interactions";
import { Roboto_Mono } from "next/font/google";
import { ReactNode } from "react";

export const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-roboto-mono",
});

export function RootContainer({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        robotoMono.variable,
        robotoMono.className,
        "obi-root-container flex h-full flex-grow flex-col",
      )}
    >
      {children}
    </div>
  );
}

export function MainContainer({ children }: { children: ReactNode }) {
  return (
    <main className="obi-main-container flex h-[calc(100vh_-_80px)] w-full max-md:h-[calc(100dvh_-_64px)]">
      <div className="obi-main-content flex w-full">
        <UserInteractionsHandlers>{children}</UserInteractionsHandlers>
      </div>
    </main>
  );
}
