import { Header, PasskeyNotification } from "@/components";
import { TOSModal } from "@/components/modals/tos";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Inter } from "next/font/google";
import { ReactNode } from "react";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const Provider = dynamic(() => import("@/components/provider"), {
  ssr: false,
});
export const metadata: Metadata = {
  title: "Obi - Anything In Two Clicks",
  description: "Anything In Two Clicks",
};

export function RootContainer({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        inter.className,
        "flex min-h-screen flex-col bg-gradient-to-br from-black to-slate-900",
      )}
    >
      {children}
    </div>
  );
}

export function MainContainer({ children }: { children: ReactNode }) {
  return (
    <main id="main" className="relative flex w-full grow">
      {children}
    </main>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body>
        <RootContainer>
          <Provider>
            <Header />
            <PasskeyNotification />
            <MainContainer>{children}</MainContainer>
            <TOSModal />
            <div id="modal-root" />
          </Provider>
        </RootContainer>
      </body>
    </html>
  );
}
