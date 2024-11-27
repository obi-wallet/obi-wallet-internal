import { cn } from "@/lib/utils";
import { UserInteractionsHandlers } from "@/user-interactions";
import { Roboto_Mono as RobotoMono } from "next/font/google";
import { ReactNode } from "react";

// Mock font for test environment
const mockFont = {
  className: "",
  variable: "",
  style: { fontFamily: "Roboto Mono" },
};

export const robotoMono =
  typeof RobotoMono === "function"
    ? RobotoMono({
        subsets: ["latin"],
        weight: ["400"],
        variable: "--font-roboto-mono",
      })
    : mockFont;

export function RootContainer({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        robotoMono.variable,
        "obi-root-container flex h-full flex-grow flex-col",
      )}
    >
      {children}
    </div>
  );
}

export function MainContainer({ children }: { children: ReactNode }) {
  return (
    <main className="obi-main-container flex min-h-[calc(100vh_-_80px)] w-full flex-1 grow max-md:min-h-[calc(100dvh_-_64px)]">
      <div className="obi-main-content flex w-full">
        <UserInteractionsHandlers>{children}</UserInteractionsHandlers>
      </div>
    </main>
  );
}
