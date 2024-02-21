import { PasskeyNotification, Header } from "@/components";
import { TOSModal } from "@/components/modals/tos";
import { MultiThemeProvider } from "@/components/provider/multi-theme-provider";
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-black">
      <body
        className={cn(
          inter.className,
          "flex min-h-screen flex-col bg-gradient-to-br from-black to-slate-900",
        )}
      >
        <Provider>
          <MultiThemeProvider>
            <Header />
            <PasskeyNotification />
            <main id="main" className="relative flex w-full grow">
              {children}
            </main>
            <TOSModal />
            <div id="modal-root" />
          </MultiThemeProvider>
        </Provider>
      </body>
    </html>
  );
}
