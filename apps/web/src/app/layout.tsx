import { PasskeyNotification, Header } from "@/components";
import { MultiThemeProvider } from "@/components/provider/multi-theme-provider";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Inter } from "next/font/google";
import { ReactNode } from "react";

import "./globals.css";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

const Provider = dynamic(() => import("@/components/provider"), {
  ssr: false,
});
export const metadata: Metadata = {
  title: "Obi - Anything in two clicks",
  description: "Anything in two clicks",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-black">
      <Head>
        <title>Obi</title>
        <meta property="og:title" content="Obi" key="title" />
      </Head>
      <body
        className={cn(
          inter.className,
          "bg-gradient-background flex min-h-screen flex-col",
        )}
      >
        <Provider>
          <MultiThemeProvider>
            <Header />
            <PasskeyNotification />
            <main id="main" className="relative flex w-full grow">
              {children}
            </main>
            <div id="modal-root" />
          </MultiThemeProvider>
        </Provider>
      </body>
    </html>
  );
}
