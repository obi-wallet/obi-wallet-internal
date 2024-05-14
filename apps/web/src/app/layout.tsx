import { RootLayoutClient } from "@/components/rootLayoutClient";
import type { Metadata } from "next";
import { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Obi - Anything In Two Clicks",
  description: "Anything In Two Clicks",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const isMaintenance = process.env.MAINTENANCE_MODE === "true";

  return (
    <html className="h-full">
      <body className="flex h-full flex-col bg-gradient-to-br from-black to-slate-900">
        <RootLayoutClient isMaintenance={isMaintenance}>
          {children}
        </RootLayoutClient>
      </body>
    </html>
  );
}
