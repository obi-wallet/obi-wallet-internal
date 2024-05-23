import { RootLayoutClient } from "@/components/root-layout-client";
import { pressStart2P } from "@/lib/fonts";
import type { Metadata } from "next";
import { ReactNode, Suspense } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Obi - Anything In Two Clicks",
  description: "Anything In Two Clicks",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const isMaintenance = process.env.MAINTENANCE_MODE === "true";

  return (
    <html className={`h-full ${pressStart2P.variable}`}>
      <body className="flex h-full flex-col bg-gradient-to-br from-black to-slate-900">
        <Suspense>
          <RootLayoutClient isMaintenance={isMaintenance}>
            {children}
          </RootLayoutClient>
        </Suspense>
      </body>
    </html>
  );
}
