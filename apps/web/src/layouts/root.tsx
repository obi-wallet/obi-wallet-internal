import { pressStart2P } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { UserInteractionsHandlers } from "@/user-interactions";
import { Inter, Roboto_Mono } from "next/font/google";
import { ReactNode } from "react";

export const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["100", "400"],
  variable: "--font-roboto-mono",
  display: "swap",
});

const inter = Inter({ subsets: ["latin"] });

export function RootContainer({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        pressStart2P.variable,
        inter.className,
        robotoMono.variable,
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
