import { Header } from "@/components";
import { TOSModal } from "@/components/modals/tos";
import { MainContainer, RootContainer } from "@/layouts/root";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ReactNode } from "react";

import "./globals.css";

const Provider = dynamic(() => import("@/components/provider"), {
  ssr: false,
});
export const metadata: Metadata = {
  title: "Obi - Anything In Two Clicks",
  description: "Anything In Two Clicks",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html className=" h-full ">
      <body className="flex h-full flex-col bg-gradient-to-br from-black to-slate-900">
        <RootContainer>
          <Provider>
            <Header />
            <MainContainer>{children}</MainContainer>
            <TOSModal />
            <div id="modal-root" />
          </Provider>
        </RootContainer>
      </body>
    </html>
  );
}
