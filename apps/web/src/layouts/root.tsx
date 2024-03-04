import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";
import { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"] });

export function RootContainer({ children }: { children: ReactNode }) {
  return (
    <div className={cn(inter.className, "flex min-h-screen flex-col bg-black")}>
      {children}
    </div>
  );
}

export function MainContainer({ children }: { children: ReactNode }) {
  return (
    <main id="main" className="flex w-full grow">
      {children}
    </main>
  );
}
