import { RootLayoutClient } from "@/components/root-layout-client";
import type { Metadata } from "next";
import { ReactNode, Suspense } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Obi - Simple and Secure Accounts",
  description: "Simple and Secure Accounts",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const isMaintenance = process.env.MAINTENANCE_MODE === "true";

  return (
    <html>
      <body style={{ overflow: "auto" }}>
        <Suspense>
          <RootLayoutClient isMaintenance={isMaintenance}>
            {children}
          </RootLayoutClient>
        </Suspense>
      </body>
    </html>
  );
}
